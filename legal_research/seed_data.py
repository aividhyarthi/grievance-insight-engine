"""Seed data: landmark legal cases, glossary terms, and brief templates."""

from datetime import date

LANDMARK_CASES = [
    # --- Constitutional Law ---
    {
        "case_name": "Marbury v. Madison",
        "case_number": "5 U.S. (1 Cranch) 137",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Constitutional",
        "year": 1803,
        "date_decided": date(1803, 2, 24),
        "jurisdiction": "United States",
        "judges": "Chief Justice John Marshall",
        "petitioner": "William Marbury",
        "respondent": "James Madison, Secretary of State",
        "outcome": "partial",
        "summary": "Established the principle of judicial review, giving courts the power to strike down laws that violate the Constitution. While Marbury was entitled to his commission, the Court held it lacked jurisdiction to issue the writ.",
        "facts": "William Marbury was appointed Justice of the Peace by President Adams but his commission was not delivered before Jefferson took office. Jefferson's Secretary of State, Madison, refused to deliver it. Marbury petitioned the Supreme Court for a writ of mandamus.",
        "issues": "1. Does Marbury have a right to the commission? 2. Do the laws afford him a remedy? 3. Can the Supreme Court issue this remedy?",
        "legal_reasoning": "Marshall held that Marbury had a right to the commission and that the law provided a remedy. However, Section 13 of the Judiciary Act of 1789, which gave the Supreme Court original jurisdiction to issue writs of mandamus, conflicted with Article III of the Constitution. When a statute conflicts with the Constitution, the Constitution prevails.",
        "key_principles": "Judicial review; Supremacy of the Constitution; Courts have the duty to say what the law is; Unconstitutional statutes are void",
        "statutes_referenced": "Article III of the U.S. Constitution; Judiciary Act of 1789, Section 13",
        "precedents_cited": "None (this case established the precedent)",
        "impact": "Foundation of constitutional law worldwide. Established that the judiciary is the ultimate interpreter of the Constitution. This principle has been adopted by courts globally.",
        "tags": "constitutional,judicial review,separation of powers,landmark,supreme court",
    },
    {
        "case_name": "Brown v. Board of Education",
        "case_number": "347 U.S. 483",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Constitutional",
        "year": 1954,
        "date_decided": date(1954, 5, 17),
        "jurisdiction": "United States",
        "judges": "Chief Justice Earl Warren (unanimous)",
        "petitioner": "Oliver Brown et al.",
        "respondent": "Board of Education of Topeka",
        "outcome": "favor",
        "summary": "Declared that state laws establishing separate public schools for Black and white students were unconstitutional, overturning the 'separate but equal' doctrine from Plessy v. Ferguson.",
        "facts": "Black children were denied admission to public schools attended by white children under laws requiring or permitting racial segregation. The plaintiffs argued this violated the Equal Protection Clause of the 14th Amendment.",
        "issues": "Does segregation of children in public schools solely on the basis of race deprive minority children of equal educational opportunities?",
        "legal_reasoning": "The Court found that segregation in education generates a feeling of inferiority that affects children's motivation to learn. Separate educational facilities are inherently unequal regardless of physical equality. Education is the foundation of citizenship and must be available to all on equal terms.",
        "key_principles": "Separate but equal is inherently unequal; Equal protection under the law; Education as a fundamental right; Desegregation mandate",
        "statutes_referenced": "14th Amendment Equal Protection Clause",
        "precedents_cited": "Plessy v. Ferguson (1896) — overruled; Sweatt v. Painter (1950); McLaurin v. Oklahoma (1950)",
        "impact": "Ended legal racial segregation in public schools. Became the cornerstone of the civil rights movement. Led to desegregation in all public facilities.",
        "tags": "constitutional,civil rights,equal protection,education,desegregation,landmark",
    },
    {
        "case_name": "Miranda v. Arizona",
        "case_number": "384 U.S. 436",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Criminal",
        "year": 1966,
        "date_decided": date(1966, 6, 13),
        "jurisdiction": "United States",
        "judges": "Chief Justice Earl Warren; 5-4 decision",
        "petitioner": "Ernesto Miranda",
        "respondent": "State of Arizona",
        "outcome": "favor",
        "summary": "Established that detained criminal suspects must be informed of their constitutional rights before police questioning. Created the famous 'Miranda warnings' requirement.",
        "facts": "Ernesto Miranda was arrested and interrogated for two hours without being informed of his Fifth Amendment right against self-incrimination or his Sixth Amendment right to counsel. He signed a confession that was used at trial.",
        "issues": "Are statements obtained from an individual subjected to custodial police interrogation admissible if the person was not informed of constitutional rights?",
        "legal_reasoning": "The Court found that the prosecution may not use statements from custodial interrogation unless procedural safeguards were used to secure the privilege against self-incrimination. The atmosphere of interrogation is inherently coercive, and safeguards must be employed to protect constitutional rights.",
        "key_principles": "Right to remain silent; Right to an attorney during interrogation; Miranda warnings requirement; Exclusion of coerced confessions",
        "statutes_referenced": "5th Amendment (self-incrimination); 6th Amendment (right to counsel); 14th Amendment (due process)",
        "precedents_cited": "Escobedo v. Illinois (1964); Gideon v. Wainwright (1963)",
        "impact": "Created the universally known Miranda warnings. Fundamentally changed police interrogation procedures worldwide. Remains one of the most well-known Supreme Court decisions.",
        "tags": "criminal,rights of accused,interrogation,miranda rights,fifth amendment,landmark",
    },
    # --- Civil Law ---
    {
        "case_name": "Donoghue v. Stevenson",
        "case_number": "[1932] AC 562",
        "court": "House of Lords (UK)",
        "court_level": "supreme",
        "case_type": "Civil",
        "year": 1932,
        "date_decided": date(1932, 5, 26),
        "jurisdiction": "United Kingdom",
        "judges": "Lord Atkin, Lord Buckmaster, Lord Tomlin, Lord Thankerton, Lord Macmillan",
        "petitioner": "May Donoghue",
        "respondent": "David Stevenson",
        "outcome": "favor",
        "summary": "Established the modern concept of negligence and the 'neighbour principle' — that one owes a duty of care to persons who are closely and directly affected by one's actions.",
        "facts": "May Donoghue drank ginger beer from an opaque bottle purchased by a friend. The bottle contained a decomposed snail. She became ill and sued the manufacturer. Since she hadn't bought the drink herself, there was no contractual relationship with the manufacturer.",
        "issues": "Does a manufacturer owe a duty of care to the ultimate consumer of a product when there is no contractual relationship?",
        "legal_reasoning": "Lord Atkin established the neighbour principle: 'You must take reasonable care to avoid acts or omissions which you can reasonably foresee would be likely to injure your neighbour.' A manufacturer owes a duty of care to the end consumer when there is no reasonable possibility of intermediate examination.",
        "key_principles": "Neighbour principle; Duty of care in negligence; Manufacturer liability to end consumers; Tort of negligence; Foreseeability test",
        "statutes_referenced": "Common law principles of negligence",
        "precedents_cited": "Heaven v. Pender (1883); George v. Skivington (1869)",
        "impact": "Foundation of modern negligence law globally. The neighbour principle is taught in every law school worldwide. Shaped product liability, professional negligence, and personal injury law.",
        "tags": "civil,negligence,duty of care,tort law,product liability,landmark",
    },
    {
        "case_name": "Palsgraf v. Long Island Railroad Co.",
        "case_number": "248 N.Y. 339",
        "court": "New York Court of Appeals",
        "court_level": "high",
        "case_type": "Civil",
        "year": 1928,
        "date_decided": date(1928, 5, 29),
        "jurisdiction": "New York, United States",
        "judges": "Chief Judge Cardozo; Judge Andrews (dissent)",
        "petitioner": "Helen Palsgraf",
        "respondent": "Long Island Railroad Co.",
        "outcome": "against",
        "summary": "Landmark case on proximate cause and foreseeability in tort law. Held that a defendant owes a duty of care only to those who are in the reasonably foreseeable zone of danger.",
        "facts": "Railroad employees helped a passenger board a moving train, causing him to drop a package of fireworks. The explosion caused scales at the other end of the platform to fall on Palsgraf. She sued the railroad for negligence.",
        "issues": "Does a defendant owe a duty of care to a plaintiff who is outside the foreseeable zone of danger?",
        "legal_reasoning": "Cardozo held that negligence is not actionable unless it involves the invasion of a legally protected interest — a violation of a right. The conduct of the employees was not a wrong toward Palsgraf because the harm to her was not foreseeable. Duty is relational; it exists only toward those who might foreseeably be harmed.",
        "key_principles": "Foreseeability limits duty of care; Proximate cause; Zone of danger test; Duty is relational not absolute",
        "statutes_referenced": "Common law negligence principles",
        "precedents_cited": "Donoghue v. Stevenson concepts (later); Heaven v. Pender (1883)",
        "impact": "Defined the boundaries of negligence liability. The Cardozo vs. Andrews debate (foreseeability vs. directness) continues to shape tort law analysis.",
        "tags": "civil,negligence,proximate cause,foreseeability,tort law",
    },
    # --- Corporate / Commercial Law ---
    {
        "case_name": "Salomon v. Salomon & Co.",
        "case_number": "[1897] AC 22",
        "court": "House of Lords (UK)",
        "court_level": "supreme",
        "case_type": "Corporate",
        "year": 1897,
        "date_decided": date(1897, 11, 16),
        "jurisdiction": "United Kingdom",
        "judges": "Lord Halsbury LC, Lord Herschell, Lord Macnaghten",
        "petitioner": "Aron Salomon",
        "respondent": "Salomon & Co. Ltd",
        "outcome": "favor",
        "summary": "Established that a properly formed company is a separate legal entity from its shareholders, even if one person holds virtually all the shares. Foundation of corporate personality doctrine.",
        "facts": "Aron Salomon incorporated his boot-making business as a limited company. He held the vast majority of shares, with family members holding one share each. When the company failed, creditors argued Salomon should be personally liable for its debts.",
        "issues": "Is a company a separate legal person from its shareholders even when one shareholder has dominant control?",
        "legal_reasoning": "The House of Lords unanimously held that the company was validly formed and was a separate legal entity. Once a company is legally incorporated, it is independent and its motives in forming it are irrelevant. The company's debts are not the shareholders' debts.",
        "key_principles": "Corporate personality; Separate legal entity doctrine; Limited liability; Veil of incorporation",
        "statutes_referenced": "Companies Act 1862 (UK)",
        "precedents_cited": "None — established the precedent",
        "impact": "Cornerstone of company law worldwide. The separate legal entity principle enables modern corporate structure, limited liability, and investment. Underpins all corporate law globally.",
        "tags": "corporate,company law,separate legal entity,limited liability,landmark",
    },
    # --- Criminal Law ---
    {
        "case_name": "R v. Dudley and Stephens",
        "case_number": "(1884) 14 QBD 273",
        "court": "Queen's Bench Division (UK)",
        "court_level": "high",
        "case_type": "Criminal",
        "year": 1884,
        "date_decided": date(1884, 12, 9),
        "jurisdiction": "United Kingdom",
        "judges": "Lord Coleridge CJ",
        "petitioner": "The Crown (Regina)",
        "respondent": "Thomas Dudley and Edwin Stephens",
        "outcome": "against",
        "summary": "Established that necessity is not a defense to murder. Even in extreme survival situations, killing an innocent person to save others is murder.",
        "facts": "Four crew members were stranded at sea after their yacht sank. After 20 days with no food or water, Dudley and Stephens killed the cabin boy Richard Parker (who was ill and near death) and ate his flesh. They were rescued four days later.",
        "issues": "Can necessity serve as a legal defense to the charge of murder?",
        "legal_reasoning": "The court held that no matter how extreme the circumstances, the deliberate taking of an innocent life cannot be justified by necessity. To allow such a defense would create a dangerous precedent where the strong could sacrifice the weak. The law values all lives equally.",
        "key_principles": "Necessity is no defense to murder; Sanctity of human life; All lives are equally valuable under law; Moral limits on survival actions",
        "statutes_referenced": "Common law on murder and necessity",
        "precedents_cited": "United States v. Holmes (1842)",
        "impact": "Definitive ruling on necessity defense worldwide. Studied in every criminal law course. Raises fundamental questions about morality and law.",
        "tags": "criminal,necessity defense,murder,survival,ethics,landmark",
    },
    {
        "case_name": "Gideon v. Wainwright",
        "case_number": "372 U.S. 335",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Criminal",
        "year": 1963,
        "date_decided": date(1963, 3, 18),
        "jurisdiction": "United States",
        "judges": "Justice Hugo Black (unanimous)",
        "petitioner": "Clarence Earl Gideon",
        "respondent": "Louie L. Wainwright, Director of Corrections",
        "outcome": "favor",
        "summary": "Held that the Sixth Amendment right to counsel applies to state courts through the Fourteenth Amendment. States must provide attorneys for defendants who cannot afford them in all felony cases.",
        "facts": "Clarence Gideon was charged with breaking and entering in Florida. He could not afford a lawyer and requested the court appoint one. The judge denied the request, as Florida law only required appointed counsel in capital cases. Gideon represented himself and was convicted.",
        "issues": "Does the Sixth Amendment right to counsel in criminal cases extend to state felony defendants who cannot afford an attorney?",
        "legal_reasoning": "Justice Black wrote that any person hauled into court who is too poor to hire a lawyer cannot be assured a fair trial unless counsel is provided. Lawyers are necessities, not luxuries. The right to counsel is fundamental and essential to a fair trial.",
        "key_principles": "Right to appointed counsel for indigent defendants; Sixth Amendment applies to states; Lawyers are necessities not luxuries; Fair trial requires legal representation",
        "statutes_referenced": "6th Amendment (right to counsel); 14th Amendment (due process/incorporation)",
        "precedents_cited": "Betts v. Brady (1942) — overruled; Powell v. Alabama (1932)",
        "impact": "Created the modern public defender system. Ensured legal representation for millions of Americans who cannot afford attorneys. Fundamental to criminal justice reform.",
        "tags": "criminal,right to counsel,sixth amendment,public defender,indigent rights,landmark",
    },
    # --- Family Law ---
    {
        "case_name": "Loving v. Virginia",
        "case_number": "388 U.S. 1",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Family",
        "year": 1967,
        "date_decided": date(1967, 6, 12),
        "jurisdiction": "United States",
        "judges": "Chief Justice Earl Warren (unanimous)",
        "petitioner": "Richard Loving and Mildred Jeter Loving",
        "respondent": "Commonwealth of Virginia",
        "outcome": "favor",
        "summary": "Struck down all state laws banning interracial marriage as violations of the Equal Protection and Due Process Clauses of the 14th Amendment. Established marriage as a fundamental right.",
        "facts": "Richard Loving (white) and Mildred Jeter (Black/Native American) were married in Washington D.C. and returned to Virginia, where they were arrested under Virginia's Racial Integrity Act of 1924 banning interracial marriages.",
        "issues": "Do state laws prohibiting interracial marriage violate the Equal Protection and Due Process Clauses of the 14th Amendment?",
        "legal_reasoning": "The Court held that restricting marriage solely because of racial classifications violates the central meaning of the Equal Protection Clause. Marriage is one of the basic civil rights of man, fundamental to existence and survival. The freedom to marry has long been recognized as a vital personal right.",
        "key_principles": "Marriage as a fundamental right; Racial classifications in law must face strict scrutiny; Freedom to marry cannot be restricted by race; Equal protection applies to marriage laws",
        "statutes_referenced": "14th Amendment (Equal Protection & Due Process); Virginia Racial Integrity Act of 1924 — struck down",
        "precedents_cited": "Skinner v. Oklahoma (1942); Maynard v. Hill (1888)",
        "impact": "Invalidated anti-miscegenation laws in 16 states. Its reasoning on marriage as a fundamental right was later cited in Obergefell v. Hodges (2015) for same-sex marriage.",
        "tags": "family,marriage,civil rights,equal protection,interracial,fundamental rights,landmark",
    },
    {
        "case_name": "Obergefell v. Hodges",
        "case_number": "576 U.S. 644",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Family",
        "year": 2015,
        "date_decided": date(2015, 6, 26),
        "jurisdiction": "United States",
        "judges": "Justice Anthony Kennedy; 5-4 decision",
        "petitioner": "James Obergefell et al.",
        "respondent": "Richard Hodges, Director of Ohio Dept. of Health",
        "outcome": "favor",
        "summary": "Held that the fundamental right to marry is guaranteed to same-sex couples by the Due Process and Equal Protection Clauses of the 14th Amendment. Legalized same-sex marriage nationwide.",
        "facts": "James Obergefell married John Arthur in Maryland (where it was legal), then returned to Ohio which did not recognize same-sex marriages. When Arthur died, Obergefell sought to be listed as surviving spouse on the death certificate.",
        "issues": "Does the 14th Amendment require states to license and recognize same-sex marriages?",
        "legal_reasoning": "Kennedy identified four principles: (1) right to personal choice in marriage is inherent in individual autonomy, (2) marriage supports a two-person union unlike any other, (3) marriage safeguards children and families, (4) marriage is a keystone of social order. Excluding same-sex couples from marriage conflicts with a central premise of the right to marry.",
        "key_principles": "Marriage equality; Fundamental right to marry extends to same-sex couples; Dignity of individuals; Equal protection for all couples",
        "statutes_referenced": "14th Amendment (Due Process & Equal Protection)",
        "precedents_cited": "Loving v. Virginia (1967); Lawrence v. Texas (2003); United States v. Windsor (2013)",
        "impact": "Legalized same-sex marriage across all 50 states. One of the most significant civil rights decisions of the 21st century.",
        "tags": "family,marriage equality,same-sex marriage,civil rights,equal protection,landmark",
    },
    # --- Labor / Employment Law ---
    {
        "case_name": "Lochner v. New York",
        "case_number": "198 U.S. 45",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Labor",
        "year": 1905,
        "date_decided": date(1905, 4, 17),
        "jurisdiction": "United States",
        "judges": "Justice Rufus Peckham; 5-4 decision",
        "petitioner": "Joseph Lochner",
        "respondent": "State of New York",
        "outcome": "favor",
        "summary": "Struck down a New York law limiting bakers' working hours as an unconstitutional interference with freedom of contract under the Due Process Clause. Later criticized as judicial overreach.",
        "facts": "New York's Bakeshop Act limited bakers to 10 hours per day and 60 hours per week. Joseph Lochner, a bakery owner, was fined for allowing an employee to work more than the limit.",
        "issues": "Does a state law limiting working hours violate the liberty of contract protected by the 14th Amendment's Due Process Clause?",
        "legal_reasoning": "The majority held that the right to purchase or sell labor is part of the liberty protected by the 14th Amendment. The law was not a legitimate exercise of police power for health or safety but an unreasonable interference with the right of free contract.",
        "key_principles": "Liberty of contract; Limits on state police power; Substantive due process; Economic liberty (later criticized)",
        "statutes_referenced": "14th Amendment Due Process Clause; New York Bakeshop Act — struck down",
        "precedents_cited": "Allgeyer v. Louisiana (1897)",
        "impact": "Defined the 'Lochner era' (1905-1937) of judicial activism against labor regulation. Eventually repudiated. Now studied as a cautionary example of courts substituting their judgment for legislatures.",
        "tags": "labor,freedom of contract,due process,working hours,economic rights,landmark",
    },
    # --- International Law ---
    {
        "case_name": "The Nuremberg Trials (IMT)",
        "case_number": "International Military Tribunal",
        "court": "International Military Tribunal at Nuremberg",
        "court_level": "tribunal",
        "case_type": "International",
        "year": 1946,
        "date_decided": date(1946, 10, 1),
        "jurisdiction": "International",
        "judges": "Justice Geoffrey Lawrence (President), judges from USA, UK, France, USSR",
        "petitioner": "Allied Powers",
        "respondent": "Major Nazi War Criminals",
        "outcome": "against",
        "summary": "Established that individuals — not just states — can be held accountable under international law for crimes against peace, war crimes, and crimes against humanity. 'Following orders' is not a valid defense.",
        "facts": "After World War II, 24 major Nazi political and military leaders were tried for conspiracy, crimes against peace, war crimes, and crimes against humanity including the Holocaust.",
        "issues": "Can individuals be held criminally responsible under international law for state-sanctioned acts? Is 'following orders' a valid defense?",
        "legal_reasoning": "The Tribunal held that crimes against international law are committed by men, not abstract entities, and only by punishing individuals who commit such crimes can the provisions of international law be enforced. The fact that a person acted under orders does not free them from responsibility if moral choice was possible.",
        "key_principles": "Individual criminal responsibility under international law; Superior orders not a defense; Crimes against humanity defined; Accountability for state-sanctioned atrocities",
        "statutes_referenced": "London Charter of the IMT (1945); Hague Conventions; Geneva Conventions",
        "precedents_cited": "None — established international criminal law precedent",
        "impact": "Foundation of modern international criminal law. Led to the Geneva Conventions, the International Criminal Court, and the principle that 'just following orders' is not a defense to atrocities.",
        "tags": "international,war crimes,crimes against humanity,nuremberg,human rights,landmark",
    },
    # --- Intellectual Property ---
    {
        "case_name": "Apple Inc. v. Samsung Electronics Co.",
        "case_number": "No. 15-777",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Intellectual Property",
        "year": 2016,
        "date_decided": date(2016, 12, 6),
        "jurisdiction": "United States",
        "judges": "Justice Sonia Sotomayor (unanimous)",
        "petitioner": "Samsung Electronics Co.",
        "respondent": "Apple Inc.",
        "outcome": "partial",
        "summary": "Held that design patent damages should be based on the 'article of manufacture' to which the design is applied, which may be a component of a product rather than the entire product. Reduced Samsung's damages.",
        "facts": "Apple sued Samsung for infringing design patents related to the iPhone's rounded rectangular shape, bezel, and grid of icons. Samsung was ordered to pay its entire profit from phones found to infringe. Samsung argued damages should be limited to the component, not the whole phone.",
        "issues": "When design patent infringement is found, should damages be calculated based on the entire product or just the specific component embodying the patented design?",
        "legal_reasoning": "The Court held that 'article of manufacture' in patent law can mean either an end product sold to a consumer or a component of that product. The lower court erred by automatically applying damages to the entire phone rather than identifying the relevant article of manufacture.",
        "key_principles": "Design patent damages based on article of manufacture; Component vs. whole product distinction; Proportional damages in IP cases",
        "statutes_referenced": "35 U.S.C. § 289 (design patent damages); Patent Act",
        "precedents_cited": "No direct precedent — novel interpretation",
        "impact": "Reshaped design patent litigation. Prevented potentially ruinous damages claims in tech industry. Established framework for proportional IP damages.",
        "tags": "intellectual property,design patent,damages,technology,samsung,apple",
    },
    # --- Environmental Law ---
    {
        "case_name": "Massachusetts v. EPA",
        "case_number": "549 U.S. 497",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Environmental",
        "year": 2007,
        "date_decided": date(2007, 4, 2),
        "jurisdiction": "United States",
        "judges": "Justice John Paul Stevens; 5-4 decision",
        "petitioner": "Commonwealth of Massachusetts et al.",
        "respondent": "Environmental Protection Agency",
        "outcome": "favor",
        "summary": "Held that greenhouse gases are air pollutants under the Clean Air Act and that the EPA has the authority — and obligation — to regulate them if they endanger public health.",
        "facts": "Massachusetts and other states petitioned the EPA to regulate greenhouse gas emissions from new motor vehicles. The EPA denied the petition, claiming it lacked authority under the Clean Air Act and that regulation was unwise.",
        "issues": "Are greenhouse gases 'air pollutants' under the Clean Air Act? Can and must the EPA regulate them?",
        "legal_reasoning": "The Court held that CO2 and other greenhouse gases fit within the Clean Air Act's broad definition of air pollutant. The EPA cannot decline to regulate simply because it prefers not to — it must determine whether emissions endanger public health and act accordingly.",
        "key_principles": "Greenhouse gases are regulable pollutants; EPA has mandatory duty to assess endangerment; State standing for environmental harm; Agency discretion has limits",
        "statutes_referenced": "Clean Air Act, § 202(a)(1); Article III standing requirements",
        "precedents_cited": "Lujan v. Defenders of Wildlife (1992); Chevron v. NRDC (1984)",
        "impact": "Opened the door for climate change regulation in the U.S. Led to the EPA's Endangerment Finding and subsequent emissions regulations. Landmark environmental decision.",
        "tags": "environmental,climate change,EPA,clean air act,greenhouse gas,regulation,landmark",
    },
    # --- Indian Constitutional Law ---
    {
        "case_name": "Kesavananda Bharati v. State of Kerala",
        "case_number": "AIR 1973 SC 1461",
        "court": "Supreme Court of India",
        "court_level": "supreme",
        "case_type": "Constitutional",
        "year": 1973,
        "date_decided": date(1973, 4, 24),
        "jurisdiction": "India",
        "judges": "13-judge bench; Chief Justice Sikri; 7-6 decision",
        "petitioner": "His Holiness Kesavananda Bharati Sripadagalvaru",
        "respondent": "State of Kerala",
        "outcome": "partial",
        "summary": "Established the 'basic structure' doctrine — Parliament can amend any part of the Constitution but cannot alter its basic structure or essential features.",
        "facts": "Kesavananda Bharati challenged the Kerala Land Reforms Act which restricted his religious property. The case expanded to address whether Parliament's amending power under Article 368 was unlimited.",
        "issues": "Is Parliament's power to amend the Constitution unlimited under Article 368, or are there inherent limitations?",
        "legal_reasoning": "The majority held that while Parliament has wide powers to amend the Constitution, it cannot destroy or alter its basic structure. Features like supremacy of the Constitution, republican and democratic form of government, secularism, separation of powers, and fundamental rights form the basic structure.",
        "key_principles": "Basic structure doctrine; Limits on constitutional amendment power; Judicial review of amendments; Supremacy of the Constitution",
        "statutes_referenced": "Constitution of India, Article 368; 24th, 25th, 29th Constitutional Amendments",
        "precedents_cited": "Golaknath v. State of Punjab (1967); Shankari Prasad v. Union of India (1951); Sajjan Singh v. State of Rajasthan (1965)",
        "impact": "Most significant Indian constitutional decision. The basic structure doctrine has been adopted by courts in Bangladesh, Pakistan, and other nations. Prevented authoritarian constitutional changes.",
        "tags": "constitutional,basic structure,amendment power,indian law,fundamental rights,landmark",
    },
    {
        "case_name": "Vishaka v. State of Rajasthan",
        "case_number": "AIR 1997 SC 3011",
        "court": "Supreme Court of India",
        "court_level": "supreme",
        "case_type": "Labor",
        "year": 1997,
        "date_decided": date(1997, 8, 13),
        "jurisdiction": "India",
        "judges": "Chief Justice J.S. Verma, Justice Sujata Manohar, Justice B.N. Kirpal",
        "petitioner": "Vishaka and Others (NGOs and social activists)",
        "respondent": "State of Rajasthan and Union of India",
        "outcome": "favor",
        "summary": "Laid down guidelines to prevent sexual harassment at the workplace, known as the Vishaka Guidelines. These had the force of law until the Sexual Harassment Act was enacted in 2013.",
        "facts": "Bhanwari Devi, a social worker in Rajasthan, was gang-raped as retaliation for trying to prevent a child marriage. The accused were acquitted by the trial court. Women's groups filed a PIL seeking enforcement of fundamental rights of working women.",
        "issues": "What legal protections exist for women against sexual harassment at the workplace? Can the Court lay down binding guidelines in the absence of legislation?",
        "legal_reasoning": "The Court held that sexual harassment violates fundamental rights under Articles 14, 15, 19, and 21 of the Constitution. In the absence of domestic law, the Court drew from CEDAW (international convention) to frame binding guidelines for all workplaces.",
        "key_principles": "Right to safe workplace is a fundamental right; Sexual harassment violates dignity and equality; Courts can create binding guidelines in legislative vacuum; International conventions inform domestic rights",
        "statutes_referenced": "Articles 14, 15, 19(1)(g), 21 of Constitution of India; CEDAW (Convention on Elimination of Discrimination Against Women)",
        "precedents_cited": "Apparel Export Promotion Council v. A.K. Chopra (1999) — later applied Vishaka",
        "impact": "Directly led to the Sexual Harassment of Women at Workplace Act, 2013. Transformed workplace safety law in India. Pioneered use of international conventions to fill domestic legal gaps.",
        "tags": "labor,sexual harassment,women's rights,workplace safety,indian law,fundamental rights,landmark",
    },
    # --- Tax Law ---
    {
        "case_name": "Commissioner v. Glenshaw Glass Co.",
        "case_number": "348 U.S. 426",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Tax",
        "year": 1955,
        "date_decided": date(1955, 3, 14),
        "jurisdiction": "United States",
        "judges": "Chief Justice Earl Warren (unanimous)",
        "petitioner": "Commissioner of Internal Revenue",
        "respondent": "Glenshaw Glass Company",
        "outcome": "favor",
        "summary": "Established the broadest definition of taxable income: any 'undeniable accession to wealth, clearly realized, and over which the taxpayer has complete dominion' constitutes gross income.",
        "facts": "Glenshaw Glass received punitive damages in an antitrust lawsuit. The company argued that punitive damages were not 'income' under the tax code and therefore not taxable.",
        "issues": "Are punitive damages received in a lawsuit considered taxable 'gross income' under the Internal Revenue Code?",
        "legal_reasoning": "The Court defined income broadly as any undeniable accession to wealth, clearly realized, over which taxpayers have complete dominion. Congress intended to tax all gains except those specifically exempted. Punitive damages clearly meet this definition.",
        "key_principles": "Broad definition of gross income; Accession to wealth test; All gains are taxable unless specifically excluded; Congressional intent for comprehensive taxation",
        "statutes_referenced": "Internal Revenue Code § 61 (gross income); 16th Amendment",
        "precedents_cited": "Eisner v. Macomber (1920) — expanded; Commissioner v. Wilcox (1946)",
        "impact": "Fundamental tax law case. The three-part 'accession to wealth' test remains the standard for determining taxable income. Cited in virtually every income tax dispute.",
        "tags": "tax,gross income,punitive damages,taxation,IRS,landmark",
    },
    # --- Technology / Privacy ---
    {
        "case_name": "Carpenter v. United States",
        "case_number": "585 U.S. 296",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Criminal",
        "year": 2018,
        "date_decided": date(2018, 6, 22),
        "jurisdiction": "United States",
        "judges": "Chief Justice John Roberts; 5-4 decision",
        "petitioner": "Timothy Carpenter",
        "respondent": "United States",
        "outcome": "favor",
        "summary": "Held that the government's acquisition of cell-site location information (CSLI) constitutes a search under the Fourth Amendment and generally requires a warrant.",
        "facts": "FBI obtained 127 days of Timothy Carpenter's cell phone location data from wireless carriers without a warrant, using it to place him near robbery locations. The data included 12,898 location points.",
        "issues": "Does the government conduct a Fourth Amendment 'search' when it accesses historical cell phone location records from a wireless carrier?",
        "legal_reasoning": "Roberts held that individuals maintain a reasonable expectation of privacy in the record of their physical movements captured through cell-site location information. The pervasive and revealing nature of CSLI makes it fundamentally different from traditional business records. The third-party doctrine does not apply to this comprehensive surveillance tool.",
        "key_principles": "Digital privacy protection; Cell location data requires a warrant; Third-party doctrine limitations in digital age; Reasonable expectation of privacy in digital records",
        "statutes_referenced": "Fourth Amendment; Stored Communications Act, 18 U.S.C. § 2703(d)",
        "precedents_cited": "Katz v. United States (1967); Smith v. Maryland (1979); United States v. Jones (2012); Riley v. California (2014)",
        "impact": "Landmark digital privacy decision. Extended Fourth Amendment protections to digital-age surveillance. Signaled that privacy law must evolve with technology.",
        "tags": "criminal,privacy,digital rights,fourth amendment,cell phone,surveillance,technology,landmark",
    },
    # --- Contract Law ---
    {
        "case_name": "Carlill v. Carbolic Smoke Ball Company",
        "case_number": "[1893] 1 QB 256",
        "court": "Court of Appeal of England and Wales",
        "court_level": "high",
        "case_type": "Civil",
        "year": 1893,
        "date_decided": date(1893, 2, 7),
        "jurisdiction": "United Kingdom",
        "judges": "Lindley LJ, Bowen LJ, A.L. Smith LJ",
        "petitioner": "Louisa Carlill",
        "respondent": "Carbolic Smoke Ball Company",
        "outcome": "favor",
        "summary": "Landmark contract law case establishing that an advertisement can constitute a binding unilateral offer, and that performance of the conditions constitutes acceptance without need for formal communication.",
        "facts": "The Carbolic Smoke Ball Company advertised that anyone who used their smoke ball as directed and still caught influenza would receive £100. They deposited £1,000 in a bank to show sincerity. Mrs. Carlill used the product as directed, caught the flu, and claimed the reward.",
        "issues": "Can an advertisement constitute a binding contractual offer? Was there valid acceptance without communication?",
        "legal_reasoning": "The Court held that the advertisement was not mere puffery but a genuine offer to the world (unilateral contract). The deposit of £1,000 showed sincerity. Performance of the conditions (using the smoke ball as directed) constituted acceptance. Communication of acceptance was waived by the nature of the offer.",
        "key_principles": "Unilateral contracts; Advertisement as an offer; Performance as acceptance; Communication of acceptance can be waived; Consideration in unilateral contracts",
        "statutes_referenced": "Common law of contract",
        "precedents_cited": "Williams v. Carwardine (1833); Denton v. Great Northern Railway (1856)",
        "impact": "Foundation of contract law taught in every law school. Established key principles about offer, acceptance, and consideration. Relevant to modern advertising law and consumer protection.",
        "tags": "civil,contract law,unilateral contract,offer and acceptance,advertising,consumer protection,landmark",
    },
    # --- Administrative Law ---
    {
        "case_name": "Chevron U.S.A., Inc. v. Natural Resources Defense Council",
        "case_number": "467 U.S. 837",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Administrative",
        "year": 1984,
        "date_decided": date(1984, 6, 25),
        "jurisdiction": "United States",
        "judges": "Justice John Paul Stevens (unanimous 6-0)",
        "petitioner": "Chevron U.S.A., Inc.",
        "respondent": "Natural Resources Defense Council, Inc.",
        "outcome": "favor",
        "summary": "Established the 'Chevron deference' doctrine — courts should defer to a government agency's interpretation of an ambiguous statute that the agency administers, as long as the interpretation is reasonable.",
        "facts": "The EPA under Reagan adopted a 'bubble concept' allowing factories to offset pollution increases at one source with decreases at another within the same plant. The NRDC challenged this interpretation of the Clean Air Act.",
        "issues": "Should courts defer to an administrative agency's reasonable interpretation of an ambiguous statute?",
        "legal_reasoning": "Justice Stevens created a two-step test: (1) Has Congress directly spoken to the precise question at issue? If yes, that intent governs. (2) If the statute is silent or ambiguous, is the agency's interpretation reasonable? If so, courts must defer to the agency's interpretation.",
        "key_principles": "Chevron two-step test; Judicial deference to agency interpretation; Agency expertise respected; Ambiguity in statutes resolved by agencies",
        "statutes_referenced": "Clean Air Act Amendments of 1977; Administrative Procedure Act",
        "precedents_cited": "Skidmore v. Swift & Co. (1944); NLRB v. Hearst Publications (1944)",
        "impact": "One of the most cited cases in American law. The Chevron doctrine shaped administrative law for four decades. Note: Overruled by Loper Bright Enterprises v. Raimondo (2024), ending Chevron deference.",
        "tags": "administrative,chevron deference,agency interpretation,regulatory law,EPA,landmark",
    },
]


GLOSSARY_TERMS = [
    {"term": "Stare Decisis", "definition": "The legal principle that courts should follow precedents set by previous decisions. Latin for 'to stand by things decided.' Courts are bound by prior rulings of higher courts in the same jurisdiction.", "category": "General", "example_usage": "The court applied stare decisis and followed the ruling established in the earlier Supreme Court case.", "related_terms": "Precedent, Ratio Decidendi, Obiter Dictum"},
    {"term": "Habeas Corpus", "definition": "A legal action through which a person can seek relief from unlawful detention. Latin for 'you shall have the body.' It requires the detaining authority to justify the detention before a court.", "category": "Criminal", "example_usage": "The prisoner filed a writ of habeas corpus challenging the legality of his continued imprisonment.", "related_terms": "Writ, Due Process, Fundamental Rights"},
    {"term": "Ratio Decidendi", "definition": "The legal reasoning or principle upon which a court's decision is based. It is the binding part of a judgment that forms precedent for future cases.", "category": "General", "example_usage": "The ratio decidendi of the case established that manufacturers owe a duty of care to end consumers.", "related_terms": "Stare Decisis, Obiter Dictum, Precedent"},
    {"term": "Obiter Dictum", "definition": "Remarks or observations made by a judge that are not essential to the decision and do not form binding precedent. Latin for 'said in passing.' While not binding, they can be persuasive.", "category": "General", "example_usage": "The judge's comments on the broader implications of the law were considered obiter dictum.", "related_terms": "Ratio Decidendi, Precedent, Judicial Opinion"},
    {"term": "Prima Facie", "definition": "Evidence that is sufficient to establish a fact or raise a presumption unless disproved or rebutted. Latin for 'at first sight' or 'on its face.'", "category": "Evidence", "example_usage": "The plaintiff established a prima facie case of discrimination by showing disparate treatment.", "related_terms": "Burden of Proof, Presumption, Evidence"},
    {"term": "Amicus Curiae", "definition": "A person or organization that is not a party to the case but offers information or expertise to assist the court. Latin for 'friend of the court.'", "category": "Procedure", "example_usage": "The civil liberties organization filed an amicus curiae brief arguing the law was unconstitutional.", "related_terms": "Brief, Intervenor, Party"},
    {"term": "Certiorari", "definition": "A writ by which a higher court reviews a decision of a lower court. Most commonly used in the context of the Supreme Court deciding to hear an appeal. Latin for 'to be made certain.'", "category": "Procedure", "example_usage": "The Supreme Court granted certiorari to review the circuit court's controversial ruling.", "related_terms": "Writ, Appeal, Judicial Review"},
    {"term": "Tort", "definition": "A wrongful act (other than a breach of contract) that results in harm or injury to another person, giving rise to civil liability. Types include negligence, intentional torts, and strict liability.", "category": "Civil", "example_usage": "The plaintiff sued in tort for damages caused by the defendant's negligent driving.", "related_terms": "Negligence, Duty of Care, Damages, Liability"},
    {"term": "Mens Rea", "definition": "The mental element or guilty mind required to establish criminal liability. It refers to the defendant's intention, knowledge, recklessness, or negligence when committing an offense.", "category": "Criminal", "example_usage": "The prosecution must prove both actus reus and mens rea to secure a conviction for murder.", "related_terms": "Actus Reus, Intent, Criminal Liability"},
    {"term": "Actus Reus", "definition": "The physical act or unlawful omission that constitutes the external element of a crime. Combined with mens rea, it establishes criminal liability.", "category": "Criminal", "example_usage": "The actus reus of theft is the taking of another's property without their consent.", "related_terms": "Mens Rea, Crime, Omission"},
    {"term": "Res Judicata", "definition": "A matter that has been adjudicated by a competent court and may not be pursued further by the same parties. Prevents the same dispute from being relitigated.", "category": "Procedure", "example_usage": "The defendant raised the doctrine of res judicata, arguing the issue had already been decided in a prior case.", "related_terms": "Estoppel, Double Jeopardy, Final Judgment"},
    {"term": "Ultra Vires", "definition": "Actions taken beyond the legal power or authority of a person, corporation, or government body. Latin for 'beyond the powers.'", "category": "Corporate", "example_usage": "The board's decision to invest in unrelated businesses was challenged as ultra vires under the company's articles.", "related_terms": "Intra Vires, Corporate Capacity, Articles of Association"},
    {"term": "Locus Standi", "definition": "The right or capacity to bring an action or appear in a court. A party must demonstrate sufficient connection to and harm from the law or action challenged.", "category": "Procedure", "example_usage": "The environmental group was granted locus standi to challenge the factory's pollution permits.", "related_terms": "Standing, Justiciability, Party"},
    {"term": "Injunction", "definition": "A court order requiring a party to do or refrain from doing a specific act. Can be temporary (interim) or permanent. A key equitable remedy.", "category": "Remedy", "example_usage": "The court granted an injunction preventing the company from demolishing the historic building.", "related_terms": "Restraining Order, Equitable Relief, Stay"},
    {"term": "Precedent", "definition": "A court decision that serves as an authority for deciding subsequent cases involving identical or similar facts or legal issues. Binding precedent must be followed; persuasive precedent may be considered.", "category": "General", "example_usage": "The 1954 decision set a binding precedent that segregation in public schools is unconstitutional.", "related_terms": "Stare Decisis, Ratio Decidendi, Case Law"},
    {"term": "Due Process", "definition": "The legal requirement that the government must respect all legal rights owed to a person. Ensures fair treatment through the normal judicial system, including notice and opportunity to be heard.", "category": "Constitutional", "example_usage": "The defendant argued that the expedited trial violated his due process rights under the 14th Amendment.", "related_terms": "Fair Trial, Natural Justice, Fundamental Rights"},
    {"term": "Fiduciary Duty", "definition": "A legal obligation of one party (the fiduciary) to act in the best interest of another party. Applies to trustees, directors, agents, and other relationships of trust.", "category": "Corporate", "example_usage": "The company director breached his fiduciary duty by awarding contracts to his own family members.", "related_terms": "Trust, Good Faith, Corporate Governance, Duty of Care"},
    {"term": "Force Majeure", "definition": "Unforeseeable circumstances that prevent someone from fulfilling a contract. Includes natural disasters, wars, pandemics, and other events beyond reasonable control. French for 'superior force.'", "category": "Contract", "example_usage": "The supplier invoked the force majeure clause after the earthquake destroyed their manufacturing plant.", "related_terms": "Frustration, Impossibility, Act of God, Contract Discharge"},
    {"term": "Subpoena", "definition": "A legal document ordering a person to attend court as a witness or to produce documents. Failure to comply can result in contempt of court charges.", "category": "Procedure", "example_usage": "The witness was served with a subpoena duces tecum requiring her to produce all financial records.", "related_terms": "Summons, Contempt, Discovery, Witness"},
    {"term": "Voir Dire", "definition": "The process of questioning prospective jurors to determine their suitability to serve on a jury. Also refers to a preliminary examination of a witness's competence. French for 'to speak the truth.'", "category": "Procedure", "example_usage": "During voir dire, the defense attorney excused jurors who expressed bias toward the defendant.", "related_terms": "Jury Selection, Challenge, Peremptory Challenge, Bias"},
]


BRIEF_TEMPLATES = [
    {
        "name": "Criminal Defense Brief",
        "case_type": "Criminal",
        "description": "Template for preparing a defense brief in criminal proceedings. Covers all essential elements from facts to sentencing arguments.",
        "template_content": """# CRIMINAL DEFENSE BRIEF

## 1. CASE INFORMATION
- **Case Number:** [Enter case number]
- **Court:** [Enter court name]
- **Judge:** [Enter presiding judge]
- **Charges:** [List all charges with statutory references]
- **Date of Offense:** [Enter date]
- **Date of Arrest:** [Enter date]

## 2. STATEMENT OF FACTS
[Present facts favorable to the defense. Note disputed facts.]

### Prosecution's Version:
[Summarize the prosecution's factual allegations]

### Defense's Version:
[Present the defense's account of events]

### Undisputed Facts:
[List facts both sides agree on]

## 3. ISSUES FOR DETERMINATION
1. [State each legal issue clearly]
2. [Frame issues favorably for the defense]

## 4. LEGAL ARGUMENTS

### Argument 1: [Title]
**Principle:** [State the legal principle]
**Authority:** [Cite cases and statutes]
**Application:** [Apply to present facts]

### Argument 2: [Title]
**Principle:** [State the legal principle]
**Authority:** [Cite cases and statutes]
**Application:** [Apply to present facts]

## 5. EVIDENCE ANALYSIS
| Evidence | Source | Supports | Challenges |
|----------|--------|----------|------------|
| [Item]   | [Source] | [How it helps] | [Weaknesses] |

## 6. WITNESS STRATEGY
- **Defense Witnesses:** [List with expected testimony]
- **Cross-examination Points:** [Key points for prosecution witnesses]

## 7. PRECEDENTS TO CITE
1. [Case name] - [Key principle from case]
2. [Case name] - [Key principle from case]

## 8. RELIEF SOUGHT
[State what you are asking the court to do]

## 9. SENTENCING ARGUMENTS (if applicable)
- Mitigating factors: [List]
- Character evidence: [List]
- Sentencing guidelines analysis: [Discuss]""",
        "tips": "Always verify the current state of the law. Check for recent amendments to statutes. Review the judge's previous rulings on similar issues. Prepare for prosecution counter-arguments.",
    },
    {
        "name": "Civil Suit Plaint Template",
        "case_type": "Civil",
        "description": "Comprehensive template for filing a civil suit. Covers cause of action, damages, and relief sought.",
        "template_content": """# CIVIL SUIT BRIEF / PLAINT

## 1. PARTIES
- **Plaintiff:** [Full name, address, capacity]
- **Defendant:** [Full name, address, capacity]
- **Relationship between parties:** [Describe]

## 2. JURISDICTION & VENUE
- **Subject matter jurisdiction:** [Explain why this court has authority]
- **Territorial jurisdiction:** [Explain venue selection]
- **Pecuniary jurisdiction:** [If applicable, explain monetary threshold]

## 3. CAUSE OF ACTION
[Describe the wrong committed and legal basis for the claim]

### Timeline of Events:
| Date | Event | Evidence |
|------|-------|----------|
| [Date] | [What happened] | [Supporting evidence] |

## 4. STATEMENT OF FACTS
[Chronological narrative of material facts]

### Background:
[Context and relationship between parties]

### The Incident/Breach:
[Detailed account of the wrongful act]

### Consequences:
[Harm suffered by the plaintiff]

## 5. LEGAL FRAMEWORK
### Applicable Statutes:
1. [Statute] - [Relevant provision]
2. [Statute] - [Relevant provision]

### Applicable Precedents:
1. [Case] - [Principle]
2. [Case] - [Principle]

## 6. ARGUMENTS

### Argument 1: Liability
[Establish the defendant's liability]

### Argument 2: Causation
[Show the link between defendant's action and plaintiff's harm]

### Argument 3: Damages
[Quantify and justify the damages claimed]

## 7. DAMAGES CLAIMED
- **Actual/Compensatory Damages:** $[Amount] — [Basis]
- **Special Damages:** $[Amount] — [Basis]
- **Punitive Damages:** $[Amount] — [Basis]
- **Total:** $[Amount]

## 8. RELIEF SOUGHT
[Clearly state all forms of relief requested]

## 9. LIST OF DOCUMENTS
1. [Document name and description]
2. [Document name and description]""",
        "tips": "Ensure limitation period has not expired. Gather all documentary evidence before filing. Consider alternative dispute resolution options. Calculate damages precisely with supporting documentation.",
    },
    {
        "name": "Constitutional Writ Petition",
        "case_type": "Constitutional",
        "description": "Template for filing writ petitions challenging constitutional violations. Suitable for habeas corpus, mandamus, certiorari, prohibition, and quo warranto.",
        "template_content": """# CONSTITUTIONAL WRIT PETITION

## 1. PETITION DETAILS
- **Type of Writ:** [Habeas Corpus / Mandamus / Certiorari / Prohibition / Quo Warranto]
- **Court:** [Enter court name]
- **Petitioner:** [Name, address, standing]
- **Respondent:** [Name, designation, address]

## 2. STANDING (LOCUS STANDI)
[Explain how the petitioner is affected and has the right to file]

## 3. FUNDAMENTAL RIGHTS VIOLATED
| Right | Constitutional Provision | How Violated |
|-------|------------------------|--------------|
| [Right] | [Article/Section] | [Explanation] |

## 4. STATEMENT OF FACTS
[Chronological account of events leading to the petition]

## 5. GROUNDS FOR RELIEF

### Ground 1: [Title]
[Explain constitutional violation with legal authority]

### Ground 2: [Title]
[Explain constitutional violation with legal authority]

### Ground 3: [Title]
[Explain constitutional violation with legal authority]

## 6. CONSTITUTIONAL ANALYSIS
### Applicable Provisions:
[List constitutional articles/amendments with interpretation]

### Landmark Precedents:
1. [Case] — [How it supports your position]
2. [Case] — [How it supports your position]

### International Law Support (if applicable):
[Reference relevant international conventions or foreign judgments]

## 7. URGENCY
[If interim relief is needed, explain the urgency and irreparable harm]

## 8. INTERIM RELIEF SOUGHT
[Specific interim orders requested pending final hearing]

## 9. FINAL RELIEF SOUGHT
[Specific orders/declarations requested from the court]

## 10. PRAYER
[Formal statement of all reliefs sought]""",
        "tips": "Writ petitions require clear constitutional violations. Exhaust other remedies first unless the violation is fundamental. Public Interest Litigation (PIL) may have relaxed standing requirements. Document urgency for interim relief.",
    },
    {
        "name": "Corporate/Commercial Dispute Brief",
        "case_type": "Corporate",
        "description": "Template for corporate disputes including shareholder actions, director liability, contractual disputes between businesses.",
        "template_content": """# CORPORATE/COMMERCIAL DISPUTE BRIEF

## 1. PARTIES & CORPORATE DETAILS
- **Plaintiff Company:** [Name, registration number, jurisdiction]
- **Defendant Company:** [Name, registration number, jurisdiction]
- **Key Individuals:** [Directors/officers involved]

## 2. CORPORATE RELATIONSHIP
[Describe the business relationship, agreements, and history]

## 3. CONTRACTUAL FRAMEWORK
### Relevant Agreements:
| Agreement | Date | Key Terms | Status |
|-----------|------|-----------|--------|
| [Name] | [Date] | [Terms] | [Active/Breached] |

## 4. STATEMENT OF FACTS
[Chronological account of the commercial dispute]

## 5. BREACH / WRONG ALLEGED
[Specific acts or omissions constituting the breach]

## 6. LEGAL ARGUMENTS

### Contractual Claims:
[Breach of contract analysis]

### Statutory Claims:
[Company law / commercial code violations]

### Fiduciary Duty Claims:
[If applicable, director/officer duty breaches]

## 7. DAMAGES / LOSS QUANTIFICATION
| Category | Amount | Calculation Method |
|----------|--------|-------------------|
| Direct Loss | $[Amount] | [Method] |
| Consequential Loss | $[Amount] | [Method] |
| Lost Profits | $[Amount] | [Method] |

## 8. RELIEF SOUGHT
[Specific monetary and non-monetary remedies]

## 9. ARBITRATION / ADR CLAUSE
[If contract contains arbitration clause, address enforceability]""",
        "tips": "Review all relevant contracts carefully. Check for arbitration clauses that may affect jurisdiction. Document the chain of authority for corporate decisions. Preserve electronic communications as evidence.",
    },
]


def _enrich_indian_cases(cases):
    """Add extended detail fields (advocates, bench, arguments, quotes, etc.) to Indian cases."""
    import json
    enrichment = {
        "Maneka Gandhi v. Union of India": {
            "bench_size": "7-judge bench",
            "advocate_petitioner": "Soli Sorabjee",
            "advocate_respondent": "Niren De (Attorney General)",
            "outcome_detail": "The Supreme Court allowed the petition, holding that the right to travel abroad is part of personal liberty under Article 21 and the procedure must be fair, just, and reasonable.",
            "arguments_petitioner": "The impounding of passport without reasons or hearing violates Articles 14, 19, and 21. Personal liberty includes the right to travel. The procedure established by law must meet the test of reasonableness.",
            "arguments_respondent": "Article 21 only requires that procedure be established by law, not that it be reasonable. The Passports Act provides sufficient procedure. Executive action on passport is within sovereign power.",
            "judge_observations": "The expression 'personal liberty' in Article 21 is of the widest amplitude and it covers a variety of rights which go to constitute the personal liberty of man.||No person shall be deprived of his life or personal liberty except according to procedure established by law — but that procedure must be right, just, and fair, and not arbitrary, fanciful, or oppressive.",
        },
        "Golaknath v. State of Punjab": {
            "bench_size": "11-judge bench",
            "advocate_petitioner": "M.K. Nambyar",
            "advocate_respondent": "H.N. Sanyal (Advocate General)",
            "outcome_detail": "By a narrow 6-5 majority, held that Parliament has no power to amend Part III (Fundamental Rights) of the Constitution. Applied the doctrine of prospective overruling.",
            "arguments_petitioner": "Fundamental rights are sacrosanct and above the amending power of Parliament. Article 368 merely prescribes the procedure for amendment and does not confer substantive power to destroy fundamental rights.",
            "arguments_respondent": "Parliament has plenary amending power under Article 368 which extends to all provisions of the Constitution including fundamental rights. Democratic sovereignty requires this power.",
            "judge_observations": "Fundamental rights are given a transcendental position under our Constitution and are kept beyond the reach of Parliament.||The power of amendment under Article 368 does not include the power to abrogate the Constitution or to alter its basic features.",
        },
        "S.R. Bommai v. Union of India": {
            "bench_size": "9-judge bench",
            "advocate_petitioner": "Rajeev Dhavan, K.K. Venugopal",
            "advocate_respondent": "Solicitor General Dipankar Gupta",
            "outcome_detail": "The Court laid down strict guidelines for the use of Article 356, holding that the President's power is subject to judicial review and secularism is part of the basic structure.",
            "arguments_petitioner": "Dismissal of elected state governments under Article 356 for political reasons is unconstitutional. The power must be subject to judicial review. Federalism is a basic feature of the Constitution.",
            "arguments_respondent": "The President's satisfaction under Article 356 is subjective and not justiciable. The Union government acted on valid material showing constitutional breakdown in the states.",
            "judge_observations": "Secularism is a basic feature of the Constitution. The State has no religion. Any government which pursues unsecular policies or unsecular courses of action acts contrary to the constitutional mandate.||The power under Article 356 is a drastic power and should be used sparingly and as a last resort.",
        },
        "K.S. Puttaswamy v. Union of India (Right to Privacy)": {
            "bench_size": "9-judge bench",
            "advocate_petitioner": "Gopal Subramanium, Shyam Divan, Arvind Datar",
            "advocate_respondent": "K.K. Venugopal (Attorney General), Rakesh Dwivedi",
            "outcome_detail": "Unanimously held that the right to privacy is a fundamental right under Article 21 of the Constitution, overruling earlier decisions in M.P. Sharma and Kharak Singh.",
            "arguments_petitioner": "The right to privacy is implicit in the right to life and personal liberty under Article 21. Aadhaar mandating biometric data collection violates informational privacy. Previous decisions denying privacy as a fundamental right were decided by smaller benches.",
            "arguments_respondent": "The Constitution does not expressly guarantee a right to privacy. Previous decisions by 6 and 8-judge benches have held privacy is not a fundamental right. Privacy claims must yield to compelling state interests like national security and welfare.",
            "judge_observations": "Privacy is the constitutional core of human dignity. Privacy has both a normative and descriptive function. At a normative level, privacy sub-serves those eternal values upon which the guarantees of life, liberty and freedom are founded.||The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21 and as a part of the freedoms guaranteed by Part III of the Constitution.",
            "timeline_events": json.dumps([
                {"date": "2012", "event": "Aadhaar challenged in Supreme Court"},
                {"date": "2015", "event": "3-judge bench refers privacy question to larger bench"},
                {"date": "2017-07-18", "event": "5-day hearing before 9-judge bench begins"},
                {"date": "2017-08-24", "event": "Unanimous judgment: Privacy is a fundamental right"},
            ]),
        },
        "Navtej Singh Johar v. Union of India": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "Menaka Guruswamy, Arundhati Katju, Anand Grover",
            "advocate_respondent": "Tushar Mehta (Solicitor General)",
            "outcome_detail": "Unanimously struck down Section 377 IPC insofar as it criminalized consensual sexual acts between adults, decriminalizing homosexuality in India.",
            "arguments_petitioner": "Section 377 criminalizes identity, not just acts. Sexual orientation is an integral part of human identity protected by Article 21. The provision is manifestly arbitrary and discriminatory under Article 14. Constitutional morality must prevail over social morality.",
            "arguments_respondent": "The government left the decision to the wisdom of the Court. The Union did not actively defend Section 377 in its application to consensual adult acts.",
            "judge_observations": "I am what I am. So take me as I am. An individual's sexuality is a natural trait and innate to a human being. To deny it is to deny the very essence of life.||Constitutional morality requires that all individuals, irrespective of their sexual orientation, are entitled to equal citizenship and protection of the law.",
            "timeline_events": json.dumps([
                {"date": "2001", "event": "Naz Foundation files first PIL in Delhi HC"},
                {"date": "2009", "event": "Delhi HC reads down Section 377"},
                {"date": "2013-12", "event": "SC reverses Delhi HC in Koushal — re-criminalizes"},
                {"date": "2016", "event": "Curative petition filed by Johar & others"},
                {"date": "2018-07", "event": "Constitution bench hearing begins"},
                {"date": "2018-09-06", "event": "Section 377 struck down unanimously"},
            ]),
        },
        "K.M. Nanavati v. State of Maharashtra": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Karl Khandalavala",
            "advocate_respondent": "Y.V. Chandrachud (as Government Pleader)",
            "outcome_detail": "Conviction upheld for murder. Nanavati was sentenced to life imprisonment but later pardoned by the Governor of Maharashtra.",
            "arguments_petitioner": "The killing was committed under grave and sudden provocation upon learning of the affair. Nanavati acted in the heat of passion without premeditation. The jury acquittal should be upheld.",
            "arguments_respondent": "There was sufficient cooling time between learning of the affair and the shooting. Going to the naval base to obtain a revolver demonstrates premeditation. The jury verdict was perverse and influenced by public sympathy.",
            "judge_observations": "The time-gap between the provocation and the act is not a mere matter of minutes but involves a sequence of deliberate acts which indicate premeditation.||A jury verdict which no reasonable body of men could have returned must be set aside as perverse.",
        },
        "Hussainara Khatoon v. Home Secretary, State of Bihar": {
            "advocate_petitioner": "Pushpa Kapila Hingorani (pioneer of PIL)",
            "advocate_respondent": "State of Bihar (Government Advocate)",
            "outcome_detail": "Ordered the immediate release of thousands of undertrial prisoners who had been detained longer than the maximum sentence for their alleged offenses.",
            "arguments_petitioner": "Thousands of undertrials have been detained for years without trial, some for periods longer than the maximum punishment. This violates Article 21. The State is obligated to provide free legal aid.",
            "arguments_respondent": "The State faces resource constraints in providing legal aid and speeding up trials. Administrative limitations exist in the criminal justice system.",
            "judge_observations": "We think that the procedure which keeps such persons in jail without trial so long cannot possibly be regarded as reasonable, just and fair so as to be in conformity with Article 21.||The right to free legal services is an essential ingredient of reasonable, fair, and just procedure for a person accused of an offence.",
        },
        "Bachan Singh v. State of Punjab": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "Soli Sorabjee",
            "advocate_respondent": "O.P. Rana (Advocate General, Punjab)",
            "outcome_detail": "Upheld the constitutional validity of the death penalty by a 4-1 majority but established the 'rarest of rare' doctrine to restrict its application.",
            "arguments_petitioner": "The death penalty is inherently cruel and violates Article 21. It serves no penological purpose that cannot be achieved by life imprisonment. There is always a risk of executing the innocent.",
            "arguments_respondent": "The death penalty serves as a deterrent for the most heinous crimes. Parliament in its wisdom has prescribed it as a punishment. Judicial safeguards ensure fair application.",
            "judge_observations": "A real and abiding concern for the dignity of human life postulates resistance to taking a life through law's instrumentality. That ought not to be done save in the rarest of rare cases when the alternative option is unquestionably foreclosed.||The question to be answered is not whether the death sentence should be imposed but whether anything other than the death sentence would be inadequate.",
            "dissenting_opinion": "Justice Bhagwati dissented, holding that the death penalty is violative of Articles 14 and 21. It is irrevocable, irreversible, and disproportionately imposed on the poor and marginalized.",
        },
        "D.K. Basu v. State of West Bengal": {
            "advocate_petitioner": "D.K. Basu (Executive Chairman, Legal Aid Services, West Bengal)",
            "advocate_respondent": "State of West Bengal",
            "outcome_detail": "Laid down 11 mandatory requirements that police must follow during arrest and detention to prevent custodial violence.",
            "arguments_petitioner": "Custodial deaths and torture are rampant in India. The State must be held accountable for deaths in custody. Guidelines are needed to prevent police excesses.",
            "arguments_respondent": "The State accepted the need for reform and did not strongly oppose the framing of guidelines.",
            "judge_observations": "Custodial violence is a matter of concern. It is aggravated by the fact that it is committed by persons who are supposed to be the protectors of the citizens.||The right to life includes the right to live with human dignity, free from torture and assault by the State or its functionaries.",
        },
        "Olga Tellis v. Bombay Municipal Corporation": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "V.M. Tarkunde, Indira Jaising",
            "advocate_respondent": "F.S. Nariman (for BMC)",
            "outcome_detail": "Recognized the right to livelihood as part of the right to life under Article 21. Pavement dwellers cannot be evicted without notice and hearing, though the eviction itself was ultimately upheld.",
            "arguments_petitioner": "Pavement dwellers live on footpaths because they have no alternative. The right to livelihood is part of the right to life. Eviction without alternative accommodation violates Article 21.",
            "arguments_respondent": "Encroachment on public property is illegal. The municipality has a duty to keep footpaths and roads clear for public use. No one has a right to encroach on public land.",
            "judge_observations": "The sweep of the right to life conferred by Article 21 is wide and far-reaching. It does not mean merely that life cannot be extinguished or taken away as, for example, by the imposition and execution of the death sentence, except according to procedure established by law. That is but one aspect of the right to life. An equally important facet of that right is the right to livelihood.",
        },
        "M.C. Mehta v. Union of India (Oleum Gas Leak)": {
            "advocate_petitioner": "M.C. Mehta (in person, as public interest litigant)",
            "advocate_respondent": "Fali Nariman (for Shriram Industries)",
            "outcome_detail": "Established the principle of absolute liability for hazardous industries, going beyond the English rule in Rylands v. Fletcher.",
            "arguments_petitioner": "The oleum gas leak endangered the lives and health of thousands. Industries engaged in hazardous activities must bear absolute liability for harm. The Bhopal tragedy demands stronger legal standards.",
            "arguments_respondent": "The Rylands v. Fletcher rule with its exceptions should apply. Strict liability with defenses is the appropriate standard. The leak was contained quickly with minimal harm.",
            "judge_observations": "We in India cannot afford to follow the rule in Rylands v. Fletcher. We have to evolve new principles and lay down new norms which would adequately deal with new problems in the context of the social and economic conditions prevailing in India.||An enterprise which is engaged in a hazardous or inherently dangerous industry owes an absolute and non-delegable duty to the community.",
        },
        "M.C. Mehta v. Union of India (Ganga Pollution)": {
            "advocate_petitioner": "M.C. Mehta (in person)",
            "advocate_respondent": "Solicitor General of India",
            "outcome_detail": "Ordered the closure and relocation of polluting tanneries along the Ganga and established the polluter pays principle in Indian environmental law.",
            "arguments_petitioner": "Industries are discharging untreated effluents into the Ganga, destroying the river and endangering public health. The right to clean water is part of the right to life under Article 21.",
            "arguments_respondent": "Industries provide employment and contribute to the economy. Closure would cause hardship to workers. Time should be given for compliance with pollution standards.",
            "judge_observations": "The financial capacity of the tanneries should be considered as irrelevant while requiring them to set up primary treatment plants. Just as an industry which cannot pay minimum wages to its workers cannot be allowed to exist, a tannery which cannot set up a primary treatment plant cannot be permitted to continue to be in existence.",
        },
        "Shah Bano Begum v. Mohammed Ahmed Khan": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "Daniel Latifi",
            "advocate_respondent": "Mohammed Ahmed Khan (in person)",
            "outcome_detail": "Held that a Muslim woman is entitled to maintenance under Section 125 CrPC even after the iddat period, sparking a major debate on uniform civil code.",
            "arguments_petitioner": "Section 125 CrPC is a secular provision applicable to all women regardless of religion. Denying maintenance after iddat leaves divorced Muslim women destitute. Personal law cannot override statutory protection.",
            "arguments_respondent": "Muslim personal law governs maintenance for Muslim women. The husband's obligation ends with mehr and iddat period maintenance. Section 125 should not override personal law.",
            "judge_observations": "It is a matter of deep regret that Article 44 of the Constitution (Uniform Civil Code) has remained a dead letter. There is no evidence of any official activity for framing a common civil code for the country.||A common Civil Code will help the cause of national integration by removing disparate loyalties to laws which have conflicting ideologies.",
        },
        "Shayara Bano v. Union of India (Triple Talaq)": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "Salman Khurshid, V. Mohana",
            "advocate_respondent": "K.K. Venugopal (Attorney General), Kapil Sibal (for AIMPLB)",
            "outcome_detail": "By 3-2 majority, struck down the practice of triple talaq (talaq-e-biddat) as unconstitutional, holding it violates Articles 14, 15, and 21.",
            "arguments_petitioner": "Triple talaq is arbitrary and violates the fundamental rights of Muslim women. It is not an essential religious practice entitled to protection under Article 25. It has been abolished in most Muslim-majority countries.",
            "arguments_respondent": "Triple talaq is an integral part of Sunni Muslim personal law protected under Article 25. The Court should not interfere with religious personal law. Reform should come through legislation, not judicial intervention.",
            "judge_observations": "What is held to be bad in the holy Quran cannot be good in Shariat and, in that sense, what is bad in theology is bad in law as well.||An act which is itself impermissible in Islam cannot be raised to the level of an essential practice.",
            "timeline_events": json.dumps([
                {"date": "2016-02", "event": "Shayara Bano files writ petition"},
                {"date": "2017-03", "event": "SC refers matter to 5-judge Constitution bench"},
                {"date": "2017-05-11", "event": "6-day hearing begins"},
                {"date": "2017-08-22", "event": "Judgment delivered — triple talaq struck down"},
                {"date": "2019", "event": "Parliament enacts Muslim Women (Protection of Rights on Marriage) Act"},
            ]),
        },
        "Bandhua Mukti Morcha v. Union of India": {
            "advocate_petitioner": "Bandhua Mukti Morcha (through Swami Agnivesh)",
            "advocate_respondent": "Union of India (Government Advocate)",
            "outcome_detail": "Recognized bonded labour as a violation of Article 23 and directed the government to identify, release, and rehabilitate bonded labourers across India.",
            "arguments_petitioner": "Bonded labour continues to exist in India despite being outlawed. The workers are kept in inhuman conditions. Article 23 prohibits forced labour. The State has failed to implement the Bonded Labour System (Abolition) Act.",
            "arguments_respondent": "The government is taking steps to eradicate bonded labour. Implementation challenges exist due to scale and resource constraints.",
            "judge_observations": "Whenever it is shown that a labourer is made to provide forced labour, the court would raise a presumption that he is required to do so in consideration of an advance or other economic consideration received by him and is therefore a bonded labourer.",
        },
        "Indra Sawhney v. Union of India (Mandal Commission)": {
            "bench_size": "9-judge bench",
            "advocate_petitioner": "K.K. Venugopal, Arun Jaitley",
            "advocate_respondent": "K. Parasaran, Kapil Sibal",
            "outcome_detail": "Upheld 27% reservation for OBCs but imposed a 50% ceiling on total reservations. Introduced the 'creamy layer' concept to exclude affluent members of backward classes.",
            "arguments_petitioner": "The Mandal Commission recommendations providing 27% OBC reservation violate the right to equality. Caste-based reservations are discriminatory. There should be an economic criterion for backwardness.",
            "arguments_respondent": "Social backwardness in India is rooted in the caste system. OBCs constitute over 50% of the population but are underrepresented. Reservation is an affirmative action tool recognized by the Constitution.",
            "judge_observations": "A caste can be and quite often is a social class in India. If it is backward socially, it would be a backward class for the purposes of Article 16(4).||Reservation is not an exception to Article 16(1) but a facet of it — it is a method of ensuring equality.",
            "dissenting_opinion": "Justice Pandian dissented on the 50% limit, arguing that the quantum of reservation should be commensurate with the population of backward classes and that the ceiling is arbitrary.",
            "timeline_events": json.dumps([
                {"date": "1979", "event": "Mandal Commission constituted"},
                {"date": "1980", "event": "Commission submits report recommending 27% OBC reservation"},
                {"date": "1990-08", "event": "V.P. Singh government accepts Mandal recommendations"},
                {"date": "1990-09", "event": "Widespread protests, Indra Sawhney files petition"},
                {"date": "1992-11-16", "event": "9-judge bench delivers landmark judgment"},
            ]),
        },
        "A.K. Kraipak v. Union of India": {
            "advocate_petitioner": "V.M. Tarkunde",
            "advocate_respondent": "Niren De (Attorney General)",
            "outcome_detail": "Extended the principles of natural justice to administrative and quasi-judicial proceedings, not just judicial proceedings.",
            "arguments_petitioner": "The selection process was vitiated by bias as one of the selection committee members was himself a candidate. Principles of natural justice must apply.",
            "arguments_respondent": "The selection committee acted in an administrative capacity, not a judicial one. Natural justice principles apply only to judicial or quasi-judicial proceedings.",
            "judge_observations": "The dividing line between administrative and quasi-judicial functions is being obliterated. The rules of natural justice operate in areas not covered by any law.||If the purpose of the rules of natural justice is to prevent miscarriage of justice one fails to see why those rules should not be made applicable to administrative proceedings.",
        },
        "Mohini Jain v. State of Karnataka": {
            "advocate_petitioner": "Mohini Jain (in person)",
            "advocate_respondent": "State of Karnataka, private medical colleges",
            "outcome_detail": "Held that the right to education is a fundamental right flowing from Article 21 (right to life), and charging capitation fees violates this right.",
            "arguments_petitioner": "The right to education is essential for human dignity and is implicit in Article 21. Capitation fees are arbitrary and deny education to the poor. The State has an obligation under Article 41.",
            "arguments_respondent": "Private institutions have a right to fix fees. Running educational institutions requires adequate funding. There is no express fundamental right to education in Part III.",
            "judge_observations": "The right to education flows directly from the right to life. The right to life under Article 21 and the dignity of an individual cannot be assured unless it is accompanied by the right to education.",
        },
        "Unni Krishnan v. State of Andhra Pradesh": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "F.S. Nariman",
            "advocate_respondent": "K. Parasaran, State Advocate Generals",
            "outcome_detail": "Partially affirmed Mohini Jain, holding that the right to education is a fundamental right under Article 21 up to the age of 14 years, laying the foundation for Article 21A.",
            "arguments_petitioner": "Private educational institutions should not be allowed to commercialize education. Some regulation of fees is necessary to ensure access.",
            "arguments_respondent": "Mohini Jain went too far in declaring all education a fundamental right. Private institutions need autonomy in fee fixation to remain viable.",
            "judge_observations": "The right to education understood in the context of Articles 45 and 41 means that every child has a right to free education until he completes the age of fourteen years.",
        },
        "Vodafone International Holdings v. Union of India": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Harish Salve, Arvind Datar",
            "advocate_respondent": "Mohan Parasaran (Solicitor General), Arijit Prasad",
            "outcome_detail": "Ruled in favor of Vodafone, holding that the offshore transaction was not taxable in India. The Indian tax authorities had no jurisdiction to impose capital gains tax on the deal.",
            "arguments_petitioner": "The transaction between two foreign entities (Vodafone and Hutchison) took place outside India. India has no territorial jurisdiction. The look-through approach adopted by tax authorities is not supported by law.",
            "arguments_respondent": "The transaction, though structured offshore, involved transfer of Indian assets (Hutch India). Substance over form requires looking through the corporate structure. The underlying asset was Indian, making it taxable in India.",
            "judge_observations": "In tax matters, one has to look at the legal nature of the transaction and not be guided by the substance of the transaction. Tax planning is legitimate if within the framework of law.||Every strategic foreign direct investment coming to India would be liable to taxation in India, as an underlying asset is always in India. This is not what the tax law intends.",
        },
        "Shreya Singhal v. Union of India": {
            "advocate_petitioner": "Shreya Singhal (law student), Saurabh Chaudri",
            "advocate_respondent": "Tushar Mehta (Additional Solicitor General)",
            "outcome_detail": "Struck down Section 66A of the IT Act as unconstitutional for being vague and overbroad, violating the right to free speech under Article 19(1)(a).",
            "arguments_petitioner": "Section 66A is vague, with terms like 'grossly offensive' and 'menacing' being undefined. It has a chilling effect on free speech. Multiple cases of misuse show its arbitrary application.",
            "arguments_respondent": "Section 66A is necessary to prevent cyber harassment, misinformation, and online abuse. The internet requires special regulation given its reach and potential for harm.",
            "judge_observations": "Section 66A is cast so widely that virtually any opinion on any subject would be covered by it. Such a section which creates an offence on the basis of undefined terms is clearly violative of Article 19(1)(a).||Information that may be grossly offensive or which causes annoyance or inconvenience are undefined terms that do not offer a reasonable standard to guide individuals or the authorities.",
        },
        "People's Union for Civil Liberties (PUCL) v. Union of India (NOTA)": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Prashant Bhushan, Lily Thomas",
            "advocate_respondent": "Solicitor General Mohan Parasaran",
            "outcome_detail": "Directed the Election Commission to provide NOTA (None of the Above) option on EVMs, recognizing the voters' right to reject all candidates.",
            "arguments_petitioner": "The right to vote includes the right to reject all candidates. Voters who find no candidate worthy should not be compelled to choose one. Negative voting is practiced in many democracies.",
            "arguments_respondent": "NOTA may lead to confusion and instability. The present system of Form 49-O already allows voters to record dissent. Implementing NOTA requires legislative backing.",
            "judge_observations": "When a voter goes to the polling booth, the voter has the right to decide whether to exercise the right to vote or not. This necessarily includes the right to reject all candidates.||Democracy is about choices and giving the voter the right to reject candidates strengthens democracy.",
        },
        "S.P. Gupta v. Union of India (Judges Transfer Case I)": {
            "bench_size": "7-judge bench",
            "advocate_petitioner": "S.P. Gupta, Kapil Sibal",
            "advocate_respondent": "L.N. Sinha (Attorney General)",
            "outcome_detail": "Held that the executive (Chief Justice's opinion) has primacy in judicial appointments — later overruled by the Second and Third Judges Cases.",
            "arguments_petitioner": "Judicial independence requires that judges be appointed based on consultation with the Chief Justice. Executive dominance in appointments undermines the judiciary.",
            "arguments_respondent": "The Constitution vests appointment power in the President. Consultation does not mean concurrence. The executive must have the final say in appointments.",
            "judge_observations": "The concept of consultation does not mean concurrence. The President has the ultimate power of appointment.||Locus standi should not be confined to those directly affected. Any member of the public acting bona fide can bring a matter of public interest before the court.",
        },
        "S.P. Gupta v. Union of India (Right to Know)": {
            "bench_size": "7-judge bench",
            "advocate_petitioner": "S.P. Gupta",
            "advocate_respondent": "Attorney General of India",
            "outcome_detail": "Established that the right to know is a fundamental right implicit in Article 19(1)(a), laying the constitutional foundation for the Right to Information Act.",
            "arguments_petitioner": "In a democracy, citizens have a right to know how the government functions. Secrecy in government correspondence regarding judicial appointments must give way to transparency.",
            "arguments_respondent": "Government correspondence is privileged. Disclosure of internal deliberations would hamper free and frank discussion. Public interest requires some secrecy in administrative decision-making.",
            "judge_observations": "The concept of an open government is the direct emanation from the right to know which seems to be implicit in the right of free speech and expression guaranteed under Article 19(1)(a).||In a government of responsibility like ours, where all the agents of the public must be responsible for their conduct, there can be but few secrets.",
        },
        "BALCO v. Kaiser Aluminium (Bharat Aluminium Co.)": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "C.A. Sundaram, Darius Khambata",
            "advocate_respondent": "Fali Nariman, Harish Salve",
            "outcome_detail": "Overruled the Bhatia International principle, holding that Part I of the Arbitration Act does not apply to foreign-seated arbitrations. Indian courts cannot interfere with arbitrations seated outside India.",
            "arguments_petitioner": "Indian courts should have supervisory jurisdiction over foreign-seated arbitrations involving Indian parties. Bhatia International correctly extended Part I to all arbitrations.",
            "arguments_respondent": "The seat of arbitration determines jurisdiction under international arbitration law. Bhatia International has created confusion and deterred international arbitration in India.",
            "judge_observations": "The seat of arbitration is the centre of gravity of the arbitration. It determines which courts have supervisory jurisdiction.||We hold that Part I of the Arbitration Act, 1996 would have no application to international commercial arbitration held outside India.",
        },
        "Google India Pvt. Ltd. v. Visakha Industries": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Neeraj Kishan Kaul, S. Ganesh",
            "advocate_respondent": "V. Giri (Senior Advocate)",
            "outcome_detail": "Clarified the intermediary liability framework, holding that internet intermediaries like Google enjoy safe harbor protection under Section 79 when they comply with due diligence and act on receiving actual knowledge of unlawful content.",
            "arguments_petitioner": "Google acts as a mere intermediary and does not modify third-party content. Safe harbor under Section 79 protects intermediaries who comply with due diligence. Shreya Singhal guidelines on court orders must be followed.",
            "arguments_respondent": "Google has the ability to control and remove content. Defamatory content was brought to Google's notice but not removed. Intermediaries should be liable when they fail to act on complaints.",
            "judge_observations": "An intermediary which merely provides a platform and does not modify the content is entitled to protection under Section 79 of the IT Act.||The 'actual knowledge' standard as laid down in Shreya Singhal must be followed — knowledge through a court order, not mere third-party notification.",
        },
    }

    for case_data in cases:
        name = case_data["case_name"]
        if name in enrichment:
            case_data.update(enrichment[name])
    return cases


def seed_database(db):
    """Populate the database with seed data."""
    from legal_research.models import LegalCase, LegalGlossary, CaseBriefTemplate
    from legal_research.indian_cases import INDIAN_LANDMARK_CASES

    # Seed international landmark cases
    for case_data in LANDMARK_CASES:
        case = LegalCase(**case_data)
        db.session.add(case)

    # Seed Indian landmark cases — with enrichment
    enriched = _enrich_indian_cases([dict(c) for c in INDIAN_LANDMARK_CASES])
    for case_data in enriched:
        case = LegalCase(**case_data)
        db.session.add(case)

    # Seed glossary
    for term_data in GLOSSARY_TERMS:
        term = LegalGlossary(**term_data)
        db.session.add(term)

    # Seed templates
    for tmpl_data in BRIEF_TEMPLATES:
        tmpl = CaseBriefTemplate(**tmpl_data)
        db.session.add(tmpl)

    total_cases = len(LANDMARK_CASES) + len(INDIAN_LANDMARK_CASES)
    db.session.commit()
    print(f"Seeded {total_cases} cases ({len(LANDMARK_CASES)} international + {len(INDIAN_LANDMARK_CASES)} Indian), {len(GLOSSARY_TERMS)} glossary terms, {len(BRIEF_TEMPLATES)} templates.")
