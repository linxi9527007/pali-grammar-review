const ACADEMIC_TRAINING_DATA = {
  "method": [
    {
      "id": "read_sentence_as_material",
      "title": "如何把一句佛典原文变成研究材料",
      "level": "必学",
      "goal": "从“看懂大意”推进到“可记录、可引用、可分析”。",
      "steps": [
        "记录巴利原文，不只记录中文译文。",
        "做直译，保留词序和语法结构。",
        "做顺译，使中文表达自然。",
        "标注语法点，如时间宾格、处格地点、限定动词、引语结构。",
        "判断阅读类型，如佛典开头公式、叙事推进、教义定义句。",
        "写研究提醒，说明此句为什么值得注意或容易误判。"
      ],
      "example": {
        "source": "Ekaṃ samayaṃ Bhagavā Sāvatthiyaṃ viharati.",
        "literal": "一个时候，世尊，在舍卫城，住。",
        "natural": "一时，世尊住在舍卫城。",
        "grammar": "Ekaṃ samayaṃ 是时间宾格；Sāvatthiyaṃ 是处格地点；viharati 是限定动词。",
        "type": "佛典开头公式",
        "research_note": "不宜把 ekaṃ samayaṃ 当普通宾语处理，应作为佛典开头时间结构记录。"
      }
    },
    {
      "id": "formula_vs_free_sentence",
      "title": "如何判断公式句和普通句",
      "level": "必学",
      "goal": "避免把固定表达完全按普通造句机械拆解。",
      "steps": [
        "看是否在佛典中反复出现。",
        "看是否承担固定篇章功能，如开头、转折、说话、总结。",
        "看是否有传统固定译法，如“如是我闻”“一时”。",
        "先整体识别，再分析关键词。",
        "记录为“公式句/半公式句/普通句”。"
      ],
      "example": {
        "source": "Evaṃ me sutaṃ.",
        "literal": "如是，被我，听闻。",
        "natural": "如是我闻。",
        "grammar": "sutaṃ 是过去分词；整句属于佛典开头公式。",
        "type": "佛典开头公式",
        "research_note": "可作佛典叙事框架研究材料，不宜只作为普通过去分词例句。"
      }
    },
    {
      "id": "avoid_translation_only",
      "title": "为什么不能只看中文译文",
      "level": "必学",
      "goal": "建立原文优先意识。",
      "steps": [
        "先看巴利原文的词形。",
        "再看汉译是否保留了结构信息。",
        "必要时参考英译，但不把英译当原文。",
        "当译文不同，要回到巴利词形和上下文判断。",
        "研究结论必须说明依据来自原文、译文还是词典。"
      ],
      "example": {
        "source": "Dhamma",
        "literal": "法；教法；现象；事物等。",
        "natural": "需按语境翻译。",
        "grammar": "词义判断不能脱离搭配和句法环境。",
        "type": "词义研究提醒",
        "research_note": "dhamma 不总是同一个中文义项；应记录搭配和上下文。"
      }
    }
  ],
  "citation": {
    "principles": [
      {
        "title": "原文、译文、注释要分清",
        "content": "记录材料时必须区分巴利原文、现代译文、传统注释、网页说明。不要把注释或现代说明当作佛典正文。"
      },
      {
        "title": "引用要说明版本或平台",
        "content": "同一经文在 SuttaCentral、PTS、CSCD、Chaṭṭha Saṅgāyana 等体系中编号或分段可能不同。研究记录中应写明来源。"
      },
      {
        "title": "避免二手转引",
        "content": "能查原文时不要只转引别人论文里的译文或片段。至少应回到巴利原文核对关键词。"
      },
      {
        "title": "教学造句不能当原典例证",
        "content": "本站许多句子是教学句或佛典风格句，适合学语法；写论文时不能直接当作真实佛典材料，除非明确标注为教学例句。"
      }
    ],
    "citation_examples": [
      {
        "format": "DN 1",
        "meaning": "长部第1经。"
      },
      {
        "format": "MN 10",
        "meaning": "中部第10经。"
      },
      {
        "format": "SN 56.11",
        "meaning": "相应部，第56相应，第11经。"
      },
      {
        "format": "AN 3.65",
        "meaning": "增支部，三集，第65经。"
      },
      {
        "format": "Dhp 1",
        "meaning": "法句第1偈。"
      }
    ],
    "record_template": [
      "巴利原文：",
      "来源/编号：",
      "版本/平台：",
      "汉译或英译：",
      "关键词：",
      "语法点：",
      "上下文说明：",
      "研究用途："
    ]
  },
  "vocabulary": [
    {
      "id": "dhamma_study",
      "word": "dhamma",
      "title": "dhamma 词义研究示范",
      "core_warning": "dhamma 不能每次都机械译为“法”。它可能表示教法、真理、现象、事物、规则等。",
      "steps": [
        "先查词典形 dhamma。",
        "收集不同词形，如 dhammo、dhammaṃ、dhammassa、dhammā。",
        "记录搭配，如 dhammaṃ deseti、sabbe dhammā、dhamma-vinaya。",
        "比较汉译和英译。",
        "按语境区分教法义、现象义、规则义等。",
        "写出判断理由，而不是只列词典义。"
      ],
      "sample_records": [
        {
          "pali": "Buddho dhammaṃ deseti.",
          "use": "dhammaṃ 作宾格，语境中多指教法。"
        },
        {
          "pali": "Sabbe dhammā anattā.",
          "use": "dhammā 为复数，语境中指诸法/一切法。"
        },
        {
          "pali": "Dhammo ca vinayo ca.",
          "use": "与 vinaya 并列，常指法与律。"
        }
      ]
    },
    {
      "id": "dukkha_study",
      "word": "dukkha",
      "title": "dukkha 词义研究示范",
      "core_warning": "dukkha 不只是日常痛苦，也可表示不圆满、不安稳、逼迫性。",
      "steps": [
        "判断是否出现在四圣谛语境。",
        "看它是名词、形容词，还是复合词的一部分。",
        "比较 suffering、unsatisfactoriness 等英译。",
        "记录与 samudaya、nirodha、magga 的关系。",
        "避免只用现代汉语“痛苦”覆盖全部语境。"
      ],
      "sample_records": [
        {
          "pali": "Idaṃ dukkhaṃ ariyasaccaṃ.",
          "use": "四圣谛中的核心术语。"
        },
        {
          "pali": "Sabbe saṅkhārā dukkhā.",
          "use": "与诸行相关，指有为法的不圆满性。"
        }
      ]
    },
    {
      "id": "kamma_study",
      "word": "kamma",
      "title": "kamma 词义研究示范",
      "core_warning": "kamma 基本义是行为，研究时要区分行为、业、业果关联等不同语境。",
      "steps": [
        "判断 kamma 是主语还是宾语。",
        "看是否与 vipāka、cetanā 等词相关。",
        "区分日常行为义和教义术语义。",
        "记录动词搭配，如 karoti、vipaccati。",
        "不要把后世复杂业论全部倒推到每个原文例句。"
      ],
      "sample_records": [
        {
          "pali": "Kammaṃ vipaccati.",
          "use": "kammaṃ 可作中性主格，表示业成熟。"
        },
        {
          "pali": "Pāpaṃ kammaṃ karoti.",
          "use": "kammaṃ 作行为/业，受 karoti 支配。"
        }
      ]
    }
  ],
  "analysis_template": {
    "title": "语法—句法—语义学术分析模板",
    "fields": [
      {
        "name": "原文",
        "tip": "保留巴利原文，不只写译文。"
      },
      {
        "name": "词形分析",
        "tip": "标注格、数、性、人称、时态、分词等。"
      },
      {
        "name": "句法功能",
        "tip": "说明主语、宾语、状语、修饰语、谓语等功能。"
      },
      {
        "name": "语义角色",
        "tip": "说明施事、受事、工具、处所、目的、来源等。"
      },
      {
        "name": "结构类型",
        "tip": "判断是普通句、公式句、引语结构、关系结构、教义定义句等。"
      },
      {
        "name": "翻译选择",
        "tip": "说明为什么这样顺译。"
      },
      {
        "name": "可能误判",
        "tip": "列出最容易误判的地方。"
      },
      {
        "name": "研究价值",
        "tip": "说明它能支持什么语言或文献观察。"
      }
    ],
    "example": {
      "source": "Buddhena dhammo desito.",
      "word_form": "Buddhena：工具格单数；dhammo：主格单数；desito：过去分词。",
      "syntax": "Buddhena 表施事，dhammo 是被说明对象，desito 作谓语性过去分词。",
      "semantic": "语义结构为“法由佛所说”。",
      "type": "工具格施事 + 过去分词结构。",
      "translation": "顺译为“法由佛所说”。",
      "pitfall": "不要把 Buddhena 只理解为普通工具；在此结构中它表示施事。",
      "research_value": "可用于说明工具格在分词结构中的施事功能。"
    }
  },
  "research_tasks": [
    {
      "id": "task_dhamma",
      "title": "任务1：收集 5 个含 dhamma 的句子",
      "level": "入门",
      "goal": "训练词义区分和上下文记录。",
      "steps": [
        "从本站句子、SuttaCentral 或教材中找 5 个含 dhamma 的句子。",
        "记录词形，如 dhammaṃ、dhammo、dhammā。",
        "判断每例中 dhamma 的语境义。",
        "写出判断依据。"
      ],
      "output": "提交一张表：原文｜词形｜语境义｜搭配词｜判断理由。"
    },
    {
      "id": "task_ti",
      "title": "任务2：找 3 个含 iti / ti 的句子",
      "level": "入门",
      "goal": "训练引语结构识别。",
      "steps": [
        "找 3 个含 ti 或 iti 的例句。",
        "标出 ti 前面的引语内容。",
        "判断主句说话动词或回答动词。",
        "说明 ti 的作用。"
      ],
      "output": "提交：原文｜引语内容｜主句动词｜结构说明。"
    },
    {
      "id": "task_opening",
      "title": "任务3：比较 3 个佛典开头公式",
      "level": "入门",
      "goal": "训练佛典篇章结构识别。",
      "steps": [
        "找 3 条含 Evaṃ me sutaṃ 或 Ekaṃ samayaṃ 的开头句。",
        "标出时间、地点、人物、动词。",
        "比较是否出现不同地点或不同人物组合。",
        "说明哪些部分属于公式结构。"
      ],
      "output": "提交：原文｜时间｜地点｜人物｜动词｜公式结构说明。"
    },
    {
      "id": "task_locative",
      "title": "任务4：收集 5 个处格地点结构",
      "level": "入门",
      "goal": "训练处格地点识别。",
      "steps": [
        "找 5 个含处格地点的句子。",
        "标出处格词形。",
        "说明它与哪个动词相关。",
        "判断是否表示地点、时间或范围。"
      ],
      "output": "提交：原文｜处格词｜相关动词｜功能判断。"
    },
    {
      "id": "task_na_ma",
      "title": "任务5：比较 na 和 mā",
      "level": "入门",
      "goal": "训练否定结构辨析。",
      "steps": [
        "找 3 个 na 的句子和 3 个 mā 的句子。",
        "判断 na 是否为普通否定。",
        "判断 mā 是否为禁止或劝止。",
        "比较二者在语气上的差异。"
      ],
      "output": "提交：原文｜否定词｜否定对象｜语气功能。"
    },
    {
      "id": "task_formula",
      "title": "任务6：记录 3 个佛典公式句",
      "level": "进阶",
      "goal": "训练公式句识别和非机械翻译意识。",
      "steps": [
        "找 3 个反复出现的佛典公式句。",
        "写出直译和顺译。",
        "说明它在篇章中的功能。",
        "指出为什么不能完全机械直译。"
      ],
      "output": "提交：原文｜直译｜顺译｜篇章功能｜研究提醒。"
    }
  ],
  "pitfalls": [
    {
      "title": "只看中文译文，不看巴利原文",
      "fix": "所有语法和词义判断都应回到巴利词形。"
    },
    {
      "title": "只查一个词典就下结论",
      "fix": "重要术语应至少比较一个巴英词典、一个汉译或课堂材料。"
    },
    {
      "title": "把教学句当作原典例证",
      "fix": "教学句只能说明语法，论文材料必须来自明确原典。"
    },
    {
      "title": "把词典义直接套进所有语境",
      "fix": "词义必须结合搭配、句法和上下文判断。"
    },
    {
      "title": "不区分正文、注释、现代说明",
      "fix": "记录材料时要明确文本层级。"
    },
    {
      "title": "不说明引用版本或平台",
      "fix": "至少记录来源平台、经号/编号和检索日期。"
    },
    {
      "title": "用现代汉语概念反推巴利语含义",
      "fix": "先看巴利原文及其语境，再选择中文表达。"
    },
    {
      "title": "忽略公式句和固定表达",
      "fix": "佛典开头、说话、回答、总结等公式句应单独标注。"
    }
  ]
};
