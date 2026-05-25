const BUDDHIST_BACKGROUND_DATA = {
  "concepts": [
    {
      "id": "buddha",
      "pali": "Buddha",
      "cn": "佛；觉者",
      "en": "Buddha; awakened one",
      "category": "三宝与人物",
      "level": "必学",
      "basic": "指觉悟者。在佛典中常与 Bhagavā、Tathāgata 等称号相关出现。",
      "reading_tip": "遇到 Buddha / Bhagavā / Tathāgata 时，要结合上下文判断是称号、主语还是礼敬对象。",
      "example": "Buddho dhammaṃ deseti.",
      "related": [
        "Dhamma",
        "Saṅgha",
        "Bhagavā"
      ]
    },
    {
      "id": "dhamma",
      "pali": "Dhamma",
      "cn": "法；教法；真理；现象",
      "en": "teaching; truth; phenomenon",
      "category": "三宝与核心教义",
      "level": "必学",
      "basic": "Dhamma 语义范围很宽，可指佛陀教法、真理、法则，也可指现象或事物。",
      "reading_tip": "不要每次机械译为“法”。读四圣谛、缘起、三宝时，Dhamma 的含义会随语境变化。",
      "example": "Yo dhammaṃ passati, so maṃ passati.",
      "related": [
        "Buddha",
        "Saṅgha",
        "ariyasacca"
      ]
    },
    {
      "id": "sangha",
      "pali": "Saṅgha",
      "cn": "僧伽；僧团",
      "en": "community; monastic community",
      "category": "三宝与人物",
      "level": "必学",
      "basic": "常指佛教僧团，也可在三宝中指圣弟子僧。语境不同，范围可能不同。",
      "reading_tip": "读三宝公式时，Buddha、Dhamma、Saṅgha 常并列。不要把 Saṅgha 简单理解为单个僧人。",
      "example": "Buddho ca dhammo ca saṅgho ca.",
      "related": [
        "Buddha",
        "Dhamma"
      ]
    },
    {
      "id": "dukkha",
      "pali": "dukkha",
      "cn": "苦；不圆满；逼迫性",
      "en": "suffering; unsatisfactoriness",
      "category": "核心教义",
      "level": "必学",
      "basic": "dukkha 不只指身体痛苦，也可指无常条件下的不安稳、不圆满。",
      "reading_tip": "在四圣谛中 dukkha 是核心术语，不宜只按日常汉语“痛苦”理解。",
      "example": "Idaṃ dukkhaṃ ariyasaccaṃ.",
      "related": [
        "ariyasacca",
        "anicca",
        "anattā"
      ]
    },
    {
      "id": "anicca",
      "pali": "anicca",
      "cn": "无常",
      "en": "impermanent",
      "category": "核心教义",
      "level": "必学",
      "basic": "指有为法不断变化、不能恒常保持。",
      "reading_tip": "常与 dukkha、anattā 构成三相相关表达。读到 sabbe saṅkhārā aniccā 时要注意复数和形容词一致。",
      "example": "Sabbe saṅkhārā aniccā.",
      "related": [
        "dukkha",
        "anattā",
        "saṅkhāra"
      ]
    },
    {
      "id": "anatta",
      "pali": "anattā",
      "cn": "无我",
      "en": "not-self",
      "category": "核心教义",
      "level": "必学",
      "basic": "指诸法中没有可执为恒常、自在、主宰的我。",
      "reading_tip": "anattā 在教义句中常与 anicca、dukkha 一起出现，不应简单理解为“没有人”。",
      "example": "Sabbe dhammā anattā.",
      "related": [
        "anicca",
        "dukkha",
        "dhamma"
      ]
    },
    {
      "id": "kamma",
      "pali": "kamma",
      "cn": "业；行为",
      "en": "action; karma",
      "category": "核心教义",
      "level": "必学",
      "basic": "基本含义是行为，尤其是有意志的身、语、意行为及其道德后果关联。",
      "reading_tip": "kammaṃ 可能是中性主格或宾格，要结合句子判断。",
      "example": "Kammaṃ vipaccati.",
      "related": [
        "vipāka",
        "cetanā"
      ]
    },
    {
      "id": "nibbana",
      "pali": "nibbāna",
      "cn": "涅槃",
      "en": "nibbāna; liberation",
      "category": "修道与解脱",
      "level": "选学",
      "basic": "解脱的目标，常与贪嗔痴的止息、苦的止息相关。",
      "reading_tip": "nibbāna 是重要教义词，初学阶段先知道它是修道目标，不宜展开复杂哲学争论。",
      "example": "Nibbānaṃ paramaṃ sukhaṃ.",
      "related": [
        "magga",
        "dukkha",
        "taṇhā"
      ]
    },
    {
      "id": "sila",
      "pali": "sīla",
      "cn": "戒；德行",
      "en": "virtue; ethical conduct",
      "category": "修道与实践",
      "level": "必学",
      "basic": "指伦理行为和戒行，是修道基础之一。",
      "reading_tip": "sīla 常与 samādhi、paññā 构成戒定慧三学。",
      "example": "Sīlaṃ rakkhati.",
      "related": [
        "samādhi",
        "paññā"
      ]
    },
    {
      "id": "samadhi",
      "pali": "samādhi",
      "cn": "定",
      "en": "concentration",
      "category": "修道与实践",
      "level": "必学",
      "basic": "指心的稳定、专注与定力。",
      "reading_tip": "samādhi 常在修道语境中与 sīla、paññā 相连。",
      "example": "Samādhi bhāvetabbo.",
      "related": [
        "sīla",
        "paññā",
        "jhāna"
      ]
    },
    {
      "id": "panna",
      "pali": "paññā",
      "cn": "慧；智慧",
      "en": "wisdom; understanding",
      "category": "修道与实践",
      "level": "必学",
      "basic": "指洞察和理解，尤其是对实相、四圣谛、无常苦无我的理解。",
      "reading_tip": "paññāya 可能是工具格，表示“以智慧”。",
      "example": "Paññāya passati.",
      "related": [
        "sīla",
        "samādhi"
      ]
    },
    {
      "id": "tanha",
      "pali": "taṇhā",
      "cn": "渴爱",
      "en": "craving",
      "category": "核心教义",
      "level": "选学",
      "basic": "指渴求、贪爱，是苦集圣谛中的关键概念。",
      "reading_tip": "在缘起和四圣谛中，taṇhā 常是需要重点识别的教义词。",
      "example": "Taṇhā dukkhasamudayo.",
      "related": [
        "dukkha",
        "samudaya",
        "nibbāna"
      ]
    },
    {
      "id": "avijja",
      "pali": "avijjā",
      "cn": "无明",
      "en": "ignorance",
      "category": "核心教义",
      "level": "选学",
      "basic": "指对四圣谛、缘起等真理的无知，是缘起链中的重要环节。",
      "reading_tip": "avijjā 是阴性名词，阅读缘起句时常作为条件结构的起点。",
      "example": "Avijjāpaccayā saṅkhārā.",
      "related": [
        "paṭiccasamuppāda",
        "saṅkhāra"
      ]
    },
    {
      "id": "sankhara",
      "pali": "saṅkhāra",
      "cn": "行；造作；诸行",
      "en": "formations; volitional formations",
      "category": "核心教义",
      "level": "选学",
      "basic": "语义复杂，可指造作、行蕴、诸行等。具体意义必须看语境。",
      "reading_tip": "在 sabbe saṅkhārā aniccā 中常译“诸行”；在缘起中则常指行。",
      "example": "Sabbe saṅkhārā aniccā.",
      "related": [
        "anicca",
        "avijjā",
        "paṭiccasamuppāda"
      ]
    },
    {
      "id": "paticcasamuppada",
      "pali": "paṭiccasamuppāda",
      "cn": "缘起",
      "en": "dependent origination",
      "category": "核心教义",
      "level": "选学",
      "basic": "指诸法依条件而生起的关系，是佛教重要教义。",
      "reading_tip": "缘起句常见 X-paccayā Y 结构，阅读时要抓住“以 X 为缘，Y 生起”。",
      "example": "Avijjāpaccayā saṅkhārā.",
      "related": [
        "avijjā",
        "saṅkhāra",
        "paccaya"
      ]
    },
    {
      "id": "ariyasacca",
      "pali": "ariyasacca",
      "cn": "圣谛",
      "en": "noble truth",
      "category": "核心教义",
      "level": "必学",
      "basic": "ariyasacca 是 ariya + sacca 的复合词，常见于四圣谛。",
      "reading_tip": "cattāri ariyasaccāni 是“四圣谛”，注意中性复数形式。",
      "example": "Cattāri ariyasaccāni.",
      "related": [
        "dukkha",
        "samudaya",
        "magga"
      ]
    },
    {
      "id": "magga",
      "pali": "magga",
      "cn": "道；道路；修道之道",
      "en": "path",
      "category": "修道与实践",
      "level": "必学",
      "basic": "可指道路，也可指通向解脱的修行道路，如八支圣道。",
      "reading_tip": "maggo bhāvetabbo 中 maggo 是主语，bhāvetabbo 是将来被动分词。",
      "example": "Maggo bhāvetabbo.",
      "related": [
        "ariyasacca",
        "nibbāna"
      ]
    },
    {
      "id": "jhana",
      "pali": "jhāna",
      "cn": "禅那",
      "en": "meditative absorption",
      "category": "修道与实践",
      "level": "进阶",
      "basic": "指禅定层次。初学阅读时先知道它属于禅修术语。",
      "reading_tip": "jhāna 相关文本常包含较多技术术语，建议结合专门教材或注释学习。",
      "example": "Paṭhamaṃ jhānaṃ upasampajja viharati.",
      "related": [
        "samādhi"
      ]
    },
    {
      "id": "sati",
      "pali": "sati",
      "cn": "念；正念",
      "en": "mindfulness",
      "category": "修道与实践",
      "level": "必学",
      "basic": "指忆念、觉知、保持清明注意，在修道语境中是重要术语。",
      "reading_tip": "sati 可出现在 satipaṭṭhāna 等复合词中，查词时要注意拆分。",
      "example": "Sati upaṭṭhitā hoti.",
      "related": [
        "satipaṭṭhāna",
        "samādhi"
      ]
    },
    {
      "id": "metta",
      "pali": "mettā",
      "cn": "慈",
      "en": "loving-kindness",
      "category": "修道与实践",
      "level": "选学",
      "basic": "指慈爱、友善愿心，常与 karuṇā、muditā、upekkhā 构成四梵住。",
      "reading_tip": "mettā 是阴性名词，相关复合表达需结合语境理解。",
      "example": "Mettā bhāvetabbā.",
      "related": [
        "karuṇā",
        "upekkhā"
      ]
    },
    {
      "id": "karuna",
      "pali": "karuṇā",
      "cn": "悲",
      "en": "compassion",
      "category": "修道与实践",
      "level": "选学",
      "basic": "指对众生苦的悲悯。",
      "reading_tip": "常与 mettā、muditā、upekkhā 并列出现。",
      "example": "Karuṇā bhāvetabbā.",
      "related": [
        "mettā",
        "upekkhā"
      ]
    },
    {
      "id": "upekkha",
      "pali": "upekkhā",
      "cn": "舍；平等舍",
      "en": "equanimity",
      "category": "修道与实践",
      "level": "选学",
      "basic": "指平等、舍心、平衡的心态。",
      "reading_tip": "upekkhā 不宜简单理解为冷漠，而是平衡、平等的心理品质。",
      "example": "Upekkhā pāramī.",
      "related": [
        "mettā",
        "karuṇā"
      ]
    },
    {
      "id": "bhikkhu",
      "pali": "bhikkhu",
      "cn": "比丘",
      "en": "monk; bhikkhu",
      "category": "三宝与人物",
      "level": "必学",
      "basic": "指出家受具足戒的男性修行者。",
      "reading_tip": "bhikkhū 可能是复数主格，也可能在某些语境中作被呼告或宾格对象，要结合句子判断。",
      "example": "Bhagavā bhikkhū āmantesi.",
      "related": [
        "bhikkhunī",
        "Saṅgha",
        "bhikkhave"
      ]
    },
    {
      "id": "bhikkhuni",
      "pali": "bhikkhunī",
      "cn": "比丘尼",
      "en": "nun; bhikkhunī",
      "category": "三宝与人物",
      "level": "选学",
      "basic": "指出家受具足戒的女性修行者。",
      "reading_tip": "bhikkhunī 是 -ī 阴性词，变格形式与阳性 bhikkhu 不同。",
      "example": "Bhikkhunī dhammaṃ suṇāti.",
      "related": [
        "bhikkhu",
        "Saṅgha"
      ]
    },
    {
      "id": "upasaka",
      "pali": "upāsaka / upāsikā",
      "cn": "优婆塞 / 优婆夷；在家信众",
      "en": "lay devotee",
      "category": "三宝与人物",
      "level": "选学",
      "basic": "upāsaka 指男性在家信众，upāsikā 指女性在家信众。",
      "reading_tip": "读叙事经文时，upāsaka/upāsikā 常作为人物身份出现。",
      "example": "Upāsako dānaṃ deti.",
      "related": [
        "dāna",
        "sīla"
      ]
    },
    {
      "id": "dana",
      "pali": "dāna",
      "cn": "布施",
      "en": "giving; generosity",
      "category": "修道与实践",
      "level": "必学",
      "basic": "指给予、布施，是在家信众和修行实践中常见概念。",
      "reading_tip": "dānaṃ 常作宾格对象，也可作为中性名词出现。",
      "example": "Dānaṃ deti.",
      "related": [
        "sīla",
        "upāsaka"
      ]
    },
    {
      "id": "sarana",
      "pali": "saraṇa",
      "cn": "皈依；依处",
      "en": "refuge",
      "category": "三宝与核心教义",
      "level": "必学",
      "basic": "指依止处，常见于皈依佛、法、僧的表达。",
      "reading_tip": "Buddhaṃ saraṇaṃ gacchāmi 中 Buddhaṃ 是宾格，saraṇaṃ 是去向/目标相关表达。",
      "example": "Buddhaṃ saraṇaṃ gacchāmi.",
      "related": [
        "Buddha",
        "Dhamma",
        "Saṅgha"
      ]
    }
  ],
  "canon_structure": [
    {
      "id": "tipitaka",
      "title": "Tipiṭaka 三藏",
      "type": "总结构",
      "explanation": "Tipiṭaka 意为“三藏”，通常指律藏、经藏、论藏三大部分。",
      "items": [
        {
          "abbr": "Vinaya Piṭaka",
          "name": "律藏",
          "note": "戒律、僧团制度和相关叙事。"
        },
        {
          "abbr": "Sutta Piṭaka",
          "name": "经藏",
          "note": "佛陀及弟子说法为主。"
        },
        {
          "abbr": "Abhidhamma Piṭaka",
          "name": "论藏",
          "note": "较系统化的法相分析。"
        }
      ]
    },
    {
      "id": "nikaya",
      "title": "Sutta Piṭaka 经藏五部",
      "type": "经藏结构",
      "explanation": "巴利经藏常按五部 Nikāya 组织。学习阅读时最常见的是 DN、MN、SN、AN、KN。",
      "items": [
        {
          "abbr": "DN",
          "name": "Dīgha Nikāya 长部",
          "note": "较长篇幅的经。"
        },
        {
          "abbr": "MN",
          "name": "Majjhima Nikāya 中部",
          "note": "中等篇幅的经。"
        },
        {
          "abbr": "SN",
          "name": "Saṃyutta Nikāya 相应部",
          "note": "按主题相应组织。"
        },
        {
          "abbr": "AN",
          "name": "Aṅguttara Nikāya 增支部",
          "note": "按数字增一组织。"
        },
        {
          "abbr": "KN",
          "name": "Khuddaka Nikāya 小部",
          "note": "集合多种短篇、偈颂、故事等文本。"
        }
      ]
    },
    {
      "id": "khuddaka",
      "title": "小部常见略号",
      "type": "略号",
      "explanation": "小部 Khuddaka Nikāya 内部包含许多常见文本。初学者先认识最常见略号即可。",
      "items": [
        {
          "abbr": "Dhp",
          "name": "Dhammapada 法句",
          "note": "偈颂集，引用极常见。"
        },
        {
          "abbr": "Ud",
          "name": "Udāna 自说",
          "note": "自说经。"
        },
        {
          "abbr": "Iti",
          "name": "Itivuttaka 如是语",
          "note": "常见短经集。"
        },
        {
          "abbr": "Snp",
          "name": "Suttanipāta 经集",
          "note": "古老偈颂和散文材料。"
        },
        {
          "abbr": "Thag",
          "name": "Theragāthā 长老偈",
          "note": "长老偈颂。"
        },
        {
          "abbr": "Thig",
          "name": "Therīgāthā 长老尼偈",
          "note": "长老尼偈颂。"
        },
        {
          "abbr": "Jā",
          "name": "Jātaka 本生",
          "note": "本生故事。"
        }
      ]
    },
    {
      "id": "vinaya",
      "title": "律藏常见术语",
      "type": "律藏",
      "explanation": "阅读律藏时会遇到戒类、篇章和僧团制度术语。这里先给最基础导航。",
      "items": [
        {
          "abbr": "Vin",
          "name": "Vinaya 律藏",
          "note": "律藏总称。"
        },
        {
          "abbr": "Pārājika",
          "name": "波罗夷",
          "note": "重大戒类。"
        },
        {
          "abbr": "Saṅghādisesa",
          "name": "僧残",
          "note": "需僧团处理的戒类。"
        },
        {
          "abbr": "Pācittiya",
          "name": "波逸提",
          "note": "戒类之一。"
        },
        {
          "abbr": "Mahāvagga",
          "name": "大品",
          "note": "律藏篇章。"
        },
        {
          "abbr": "Cullavagga",
          "name": "小品",
          "note": "律藏篇章。"
        }
      ]
    }
  ],
  "reference_terms": [
    {
      "term": "nikāya",
      "cn": "部",
      "note": "经藏分部，如 Dīgha Nikāya。"
    },
    {
      "term": "sutta",
      "cn": "经",
      "note": "单篇经文。"
    },
    {
      "term": "vagga",
      "cn": "品；章；组",
      "note": "常见章节单位。"
    },
    {
      "term": "nipāta",
      "cn": "集；品类",
      "note": "常按数量或类别组织。"
    },
    {
      "term": "saṃyutta",
      "cn": "相应",
      "note": "相应部中的主题组。"
    },
    {
      "term": "khandhaka",
      "cn": "犍度；篇章",
      "note": "律藏中常见结构单位。"
    },
    {
      "term": "uddāna",
      "cn": "摄颂；总结偈",
      "note": "概括内容或条目的偈。"
    },
    {
      "term": "gāthā",
      "cn": "偈颂",
      "note": "韵文句。"
    },
    {
      "term": "pāda",
      "cn": "句脚",
      "note": "偈颂的一部分。"
    },
    {
      "term": "vibhaṅga",
      "cn": "分别；解析",
      "note": "常见于论述或戒条解析结构。"
    }
  ],
  "citation_examples": [
    {
      "ref": "DN 1",
      "meaning": "长部第1经。"
    },
    {
      "ref": "MN 10",
      "meaning": "中部第10经。"
    },
    {
      "ref": "SN 56.11",
      "meaning": "相应部，第56相应，第11经。"
    },
    {
      "ref": "AN 3.65",
      "meaning": "增支部，三集，第65经。"
    },
    {
      "ref": "Dhp 1",
      "meaning": "法句第1偈。"
    },
    {
      "ref": "Snp 1.1",
      "meaning": "经集第1品第1经，具体编号体系可能因平台略有差异。"
    }
  ],
  "sutta_flow": [
    {
      "stage": "开头因缘",
      "patterns": [
        "Evaṃ me sutaṃ.",
        "Ekaṃ samayaṃ..."
      ],
      "purpose": "交代传承、时间、地点和说法人物。"
    },
    {
      "stage": "场景交代",
      "patterns": [
        "Tena kho pana samayena...",
        "Atha kho..."
      ],
      "purpose": "推进叙事，交代当时情况或人物行动。"
    },
    {
      "stage": "人物行动",
      "patterns": [
        "upasaṅkami",
        "nisīdi",
        "abhivādetvā"
      ],
      "purpose": "描述来到、坐下、礼敬等动作。"
    },
    {
      "stage": "发问或请法",
      "patterns": [
        "kathaṃ nu kho...",
        "kiṃ pana...",
        "yācati"
      ],
      "purpose": "引出问题或请法情境。"
    },
    {
      "stage": "佛陀回答",
      "patterns": [
        "Bhagavā etadavoca.",
        "Idam avoca Bhagavā."
      ],
      "purpose": "引出说法正文。"
    },
    {
      "stage": "总结与欢喜信受",
      "patterns": [
        "attamanā...",
        "abhinanduṃ"
      ],
      "purpose": "表示听众欢喜、信受、赞叹。"
    }
  ]
};
