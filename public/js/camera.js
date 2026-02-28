/* ═══════════════════════════════════════════════════════════
   camera.js
   Wraps WebRTC getUserMedia for live preview and capture.
═══════════════════════════════════════════════════════════ */

class CameraManager {
  constructor(videoEl, canvasEl) {
    this.video   = videoEl;
    this.canvas  = canvasEl;
    this.stream  = null;
    this.facing  = 'environment'; // prefer rear camera
  }

  /** Start camera stream. Returns true on success, false on failure. */
  async start() {
    // Stop any existing stream first
    this.stop();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia not supported in this browser.');
      return false;
    }

    const constraints = {
      video: {
        facingMode: { ideal: this.facing },
        width:  { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      // Wait for the video to be ready
      await new Promise((resolve, reject) => {
        this.video.onloadedmetadata = resolve;
        this.video.onerror          = reject;
      });
      return true;
    } catch (err) {
      console.error('Camera start error:', err);
      this.stream = null;
      return false;
    }
  }

  /** Stop all camera tracks. */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
      this.video.srcObject = null;
    }
  }

  /** Toggle between front and rear camera. */
  async flip() {
    this.facing = this.facing === 'environment' ? 'user' : 'environment';
    return this.start();
  }

  /**
   * Capture current video frame.
   * Returns a base64 JPEG data-URL.
   */
  capture(quality = 0.88) {
    const { videoWidth: w, videoHeight: h } = this.video;
    this.canvas.width  = w;
    this.canvas.height = h;
    const ctx = this.canvas.getContext('2d');

    // Mirror if using front camera so text reads correctly
    if (this.facing === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(this.video, 0, 0, w, h);
    return this.canvas.toDataURL('image/jpeg', quality);
  }

  get isActive() {
    return !!(this.stream && this.stream.active);
  }
}
