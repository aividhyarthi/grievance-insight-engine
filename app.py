import os
import re
import uuid
import zipfile
import io
from html import unescape
from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024  # 25 MB
app.config['UPLOAD_FOLDER'] = '/tmp/postcraft_uploads'
app.config['OUTPUT_FOLDER'] = '/tmp/postcraft_outputs'
app.secret_key = os.environ.get('SECRET_KEY', 'postcraft-dev-secret-change-in-prod')

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/health')
def health():
    return jsonify({'status': 'ok'})


@app.route('/generate', methods=['POST'])
def generate():
    # ── validate image ──────────────────────────────────────────────────────
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Unsupported file type. Use PNG, JPG, JPEG, WebP, or GIF.'}), 400

    # ── collect form fields ──────────────────────────────────────────────────
    product_name  = request.form.get('product_name', '').strip()
    tagline       = request.form.get('tagline', '').strip()
    description   = request.form.get('description', '').strip()
    brand_name    = request.form.get('brand_name', '').strip()
    cta           = request.form.get('cta', 'Shop Now').strip()
    post_type     = request.form.get('post_type', 'individual')   # individual | carousel
    platform      = request.form.get('platform', 'instagram_square')
    style         = request.form.get('style', 'minimal')
    api_key       = request.form.get('api_key', '').strip() or os.environ.get('ANTHROPIC_API_KEY', '')

    if not product_name:
        return jsonify({'error': 'Product name is required'}), 400

    # ── session setup ────────────────────────────────────────────────────────
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(app.config['OUTPUT_FOLDER'], session_id)
    os.makedirs(session_dir, exist_ok=True)

    ext = secure_filename(file.filename).rsplit('.', 1)[-1].lower()
    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}.{ext}")
    file.save(upload_path)

    try:
        # ── generate text content ────────────────────────────────────────────
        from utils.text_generator import CaptionGenerator
        text_gen = CaptionGenerator(api_key=api_key)
        text_content = text_gen.generate(
            product_name=product_name,
            tagline=tagline,
            description=description,
            brand_name=brand_name,
            cta=cta,
            post_type=post_type,
            platform=platform,
        )

        # ── generate images ──────────────────────────────────────────────────
        from utils.image_processor import SocialMediaPostGenerator
        img_gen = SocialMediaPostGenerator()

        if post_type == 'individual':
            images = img_gen.create_individual_post(
                image_path=upload_path,
                product_name=product_name,
                tagline=text_content.get('title', tagline or product_name),
                brand_name=brand_name,
                cta=cta,
                style=style,
                platform=platform,
                output_dir=session_dir,
            )
        else:
            images = img_gen.create_carousel_posts(
                image_path=upload_path,
                product_name=product_name,
                tagline=text_content.get('title', tagline or product_name),
                description=description,
                features=text_content.get('features', []),
                brand_name=brand_name,
                cta=cta,
                style=style,
                platform=platform,
                output_dir=session_dir,
            )

        return jsonify({
            'session_id': session_id,
            'images': [os.path.basename(p) for p in images],
            'title':    text_content.get('title', product_name),
            'caption':  text_content.get('caption', ''),
            'hashtags': text_content.get('hashtags', []),
            'features': text_content.get('features', []),
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/outputs/<session_id>/<filename>')
def serve_output(session_id, filename):
    output_dir = os.path.join(app.config['OUTPUT_FOLDER'], session_id)
    return send_from_directory(output_dir, filename)


@app.route('/download/<session_id>')
def download_zip(session_id):
    session_dir = os.path.join(app.config['OUTPUT_FOLDER'], session_id)
    if not os.path.exists(session_dir):
        return jsonify({'error': 'Session not found'}), 404

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for fname in sorted(os.listdir(session_dir)):
            zf.write(os.path.join(session_dir, fname), fname)
    buf.seek(0)

    return send_file(
        buf,
        mimetype='application/zip',
        as_attachment=True,
        download_name=f'postcraft_{session_id[:8]}.zip',
    )


@app.route('/robots.txt')
def robots():
    return (
        'User-agent: *\nDisallow: /\n',
        200,
        {'Content-Type': 'text/plain'},
    )


@app.route('/scrape', methods=['POST'])
def scrape_url():
    """Fetch a product page URL and extract structured info via Claude."""
    data    = request.get_json(silent=True) or {}
    url     = data.get('url', '').strip()
    api_key = data.get('api_key', '').strip() or os.environ.get('ANTHROPIC_API_KEY', '')

    if not url:
        return jsonify({'error': 'URL is required'}), 400
    if not api_key:
        return jsonify({'error': 'Anthropic API key is required to read a URL'}), 400

    # ── fetch page ───────────────────────────────────────────────────────────
    try:
        import requests as req
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; PostCraft-Bot/1.0)'}
        resp    = req.get(url, headers=headers, timeout=12)
        resp.raise_for_status()
        raw_html = resp.text
    except Exception as exc:
        return jsonify({'error': f'Could not fetch URL: {exc}'}), 400

    # ── strip HTML to clean text (stdlib only) ───────────────────────────────
    text = re.sub(r'<(script|style)[^>]*>.*?</(script|style)>',
                  '', raw_html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = unescape(text)
    text = re.sub(r'\s+', ' ', text).strip()[:8000]

    # ── ask Claude to extract product fields ─────────────────────────────────
    try:
        import json
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=512,
            messages=[{
                'role': 'user',
                'content': (
                    'Extract product information from this webpage text. '
                    'Return ONLY a JSON object with keys: '
                    'product_name, brand_name, tagline, description, cta. '
                    'cta should be a short action phrase like "Shop Now" or "Buy Now". '
                    'Keep description to 1-2 sentences max. '
                    'Return only valid JSON, no markdown, no extra text.\n\n'
                    f'Page text:\n{text}'
                ),
            }],
        )
        result = json.loads(msg.content[0].text.strip())
        return jsonify(result)
    except Exception as exc:
        return jsonify({'error': f'Could not extract product info: {exc}'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true')
