import fs from "node:fs";

const kbPath = new URL("../data/knowledge_base.json", import.meta.url);
const kb = JSON.parse(fs.readFileSync(kbPath, "utf8"));

const moduleMeta = {
  "foundations-life-systems": {
    title_zh: "\u751f\u547d\u7cfb\u7edf\u57fa\u7840",
    learning_goal: "Build a first mental model of cells, DNA, RNA, proteins, gene expression, and regulation.",
    guiding_questions: [
      "What makes a cell a living system?",
      "How does information move from DNA to RNA to protein?",
      "Why do cells regulate genes instead of keeping every gene on?",
      "What is a chassis cell in synthetic biology?"
    ],
    checkpoint_prompt: "Explain how DNA, RNA, proteins, and regulation work together in one cell."
  },
  "biology-to-engineering": {
    title_zh: "\u4ece\u81ea\u7136\u5230\u5de5\u7a0b",
    learning_goal: "Understand why synthetic biology uses engineering ideas such as abstraction, modules, standards, and DBTL.",
    guiding_questions: [
      "What is synthetic biology trying to design?",
      "How is DBTL different from a one-time experiment?",
      "Why do engineers divide complex systems into parts, devices, and systems?",
      "Why is standardization useful but never perfect in biology?"
    ],
    checkpoint_prompt: "Use one everyday engineering example to explain the DBTL cycle."
  },
  "reading-writing-dna": {
    title_zh: "\u8bfb\u5199 DNA",
    learning_goal: "Compare DNA sequencing, synthesis, assembly, and genome editing at a high conceptual level.",
    guiding_questions: [
      "What is the difference between reading DNA and writing DNA?",
      "Why is DNA assembly a design problem, not only a technical task?",
      "How does genome editing differ from whole-system engineering?",
      "Why should operational details stay inside trained laboratories?"
    ],
    checkpoint_prompt: "Sort sequencing, synthesis, assembly, and editing into reading or writing activities."
  },
  "gene-regulation-circuits": {
    title_zh: "\u57fa\u56e0\u8c03\u63a7\u4e0e\u9057\u4f20\u7ebf\u8def",
    learning_goal: "Learn how cells use regulatory logic, feedback, switches, oscillators, and logic gates to process information.",
    guiding_questions: [
      "How can a gene circuit behave like a switch?",
      "What does feedback do in a living system?",
      "Why are cellular logic gates less predictable than electronic logic gates?",
      "What limits circuit performance inside real cells?"
    ],
    checkpoint_prompt: "Describe a simple genetic switch using input, processing, and output."
  },
  "modeling-design-tools": {
    title_zh: "\u6a21\u578b\u3001\u8ba1\u7b97\u4e0e\u8bbe\u8ba1\u5de5\u5177",
    learning_goal: "See models, simulations, CAD ideas, and design languages as tools for thinking before building.",
    guiding_questions: [
      "What can a model reveal before an experiment?",
      "Why are biological models always simplifications?",
      "How do design languages help teams communicate designs?",
      "Where can AI help and where can it mislead?"
    ],
    checkpoint_prompt: "Name one benefit and one limitation of modeling a biological network."
  },
  "biosensors-signal-processing": {
    title_zh: "\u751f\u7269\u4f20\u611f\u5668\u4e0e\u4fe1\u606f\u8f93\u5165\u8f93\u51fa",
    learning_goal: "Understand biosensors as systems that sense an input, process a signal, and produce a measurable output.",
    guiding_questions: [
      "What counts as a biological input signal?",
      "How does a biosensor convert sensing into output?",
      "Why do specificity and sensitivity matter?",
      "Why do real-world samples make sensing harder?"
    ],
    checkpoint_prompt: "Sketch a biosensor as input, processor, and output without giving an experimental protocol."
  },
  "metabolic-engineering-cell-factories": {
    title_zh: "\u4ee3\u8c22\u5de5\u7a0b\u4e0e\u7ec6\u80de\u5de5\u5382",
    learning_goal: "Connect pathways, flux, host burden, and product formation in metabolic engineering.",
    guiding_questions: [
      "What is a metabolic pathway?",
      "Why does flux matter for production?",
      "How can a cell factory make useful molecules?",
      "Why is yield only one part of a good design?"
    ],
    checkpoint_prompt: "Explain why changing one pathway step can affect the whole cell."
  },
  "cell-free-synthetic-cells": {
    title_zh: "\u7ec6\u80de\u81ea\u7531\u7cfb\u7edf\u3001\u6700\u5c0f\u57fa\u56e0\u7ec4\u4e0e\u5408\u6210\u7ec6\u80de",
    learning_goal: "Compare cell-free systems, minimal genomes, compartments, and synthetic cells as ways to study life-like systems.",
    guiding_questions: [
      "Why study biology outside living cells?",
      "What does a minimal genome teach us?",
      "Why do compartments matter for life?",
      "How are synthetic cells different from natural cells?"
    ],
    checkpoint_prompt: "Compare cell-free prototyping and living-cell engineering in two sentences."
  },
  "biomedical-frontier-applications": {
    title_zh: "\u533b\u5b66\u3001\u6750\u6599\u4e0e\u524d\u6cbf\u5e94\u7528",
    learning_goal: "Survey medical, materials, DNA nanotechnology, and frontier applications without turning them into protocols.",
    guiding_questions: [
      "How can engineered cells support medicine?",
      "Why are vaccines and immune systems important application areas?",
      "What is DNA origami at a conceptual level?",
      "What makes a living material different from an ordinary material?"
    ],
    checkpoint_prompt: "Choose one application and explain the design idea plus one safety concern."
  },
  "safety-ethics-public-trust": {
    title_zh: "\u5b89\u5168\u3001\u4f26\u7406\u4e0e\u516c\u4f17\u4fe1\u4efb",
    learning_goal: "Learn the difference between biosafety, biosecurity, dual-use concerns, governance, and public trust.",
    guiding_questions: [
      "What is the difference between biosafety and biosecurity?",
      "Why can the same knowledge have beneficial and harmful uses?",
      "How do governance and stewardship shape responsible innovation?",
      "Why should public dialogue start early?"
    ],
    checkpoint_prompt: "Explain a responsible innovation decision using benefit, risk, and public trust."
  }
};

const content = {
  "cell-basics": {
    title: "Cells as Life Systems",
    summary: "Cells are organized living systems with boundaries, energy use, information storage, and molecular machines. Meyers-style synthetic biology overviews treat the cell as the first system students must understand before they discuss engineered functions.",
    facts: [
      "A cell is not a bag of chemicals; it is a regulated system with membranes, metabolism, information, and repair.",
      "Synthetic biology designs usually depend on how a host cell allocates energy and resources.",
      "The same design can behave differently in different cellular contexts."
    ],
    analogy: "A cell is like a small city: it has borders, power use, communication, production, waste handling, and traffic rules."
  },
  "dna-rna-protein-flow": {
    title: "DNA, RNA, and Protein Information Flow",
    summary: "DNA stores genetic information, RNA helps express and regulate that information, and proteins perform many cellular jobs. This high-level information flow is a core foundation for later topics such as circuits, sensors, and cell factories.",
    facts: [
      "DNA is relatively stable information storage.",
      "RNA can carry messages, regulate expression, or take part in molecular machines.",
      "Proteins often act as enzymes, structures, transporters, receptors, or regulators."
    ],
    analogy: "DNA is a reference library, RNA is a working note, and proteins are the tools built from those notes."
  },
  "genes-regulatory-elements": {
    title: "Genes and Regulatory Elements",
    summary: "A gene is more than a protein-coding segment. Synthetic biology also cares about promoters, regulatory regions, terminators, and other control elements because they influence when, where, and how strongly genetic information is used.",
    facts: [
      "Regulatory elements shape expression timing and strength.",
      "A part's behavior depends on nearby sequence context and host cell state.",
      "Design libraries use parts conceptually, but real biology often resists perfect plug-and-play behavior."
    ],
    analogy: "A gene is a recipe plus instructions about when the kitchen should actually cook it."
  },
  "gene-expression-regulation": {
    title: "Gene Expression Regulation",
    summary: "Gene expression regulation lets cells avoid wasting resources and respond to changing conditions. For learners, regulation is the bridge between molecular biology and engineered gene circuits.",
    facts: [
      "Regulation can occur before transcription, after transcription, during translation, or through protein activity.",
      "Turning expression up or down changes both a design's output and the burden on the host cell.",
      "Regulation makes cells responsive, but it also adds delays and variability."
    ],
    analogy: "Regulation is the dimmer switch and schedule board for cellular activity."
  },
  "host-chassis": {
    title: "Hosts and Chassis Cells",
    summary: "A chassis is the living host used to carry a design. The chassis supplies resources, maintenance, and cellular context, so it strongly affects whether a synthetic biology design works as intended.",
    facts: [
      "Common teaching examples include bacteria, yeast, mammalian cells, and cell-free systems.",
      "A chassis contributes metabolism, growth behavior, stress responses, and resource limits.",
      "Good design asks whether the host is appropriate for the intended function and safety setting."
    ],
    analogy: "A chassis is the vehicle that carries the engineered system; the same engine behaves differently in different vehicles."
  },
  "synbio-definition": {
    title: "What Is Synthetic Biology?",
    summary: "Synthetic biology applies engineering principles to the study and design of biological systems. It can redesign existing functions or assemble new combinations of biological parts for research, medicine, manufacturing, and environmental applications.",
    facts: [
      "The field combines molecular biology, systems biology, engineering, computation, and ethics.",
      "Its goal is not only to edit single genes but to design functions and systems.",
      "Responsible design requires attention to safety, security, and social context."
    ],
    analogy: "It is like moving from reading nature's instructions to responsibly composing new biological designs."
  },
  "synbio-vs-editing": {
    title: "Synthetic Biology vs. Genome Editing",
    summary: "Genome editing changes DNA at selected locations, while synthetic biology uses editing, synthesis, modeling, and design ideas to build or reconfigure biological functions. Editing can be one tool inside a larger design project.",
    facts: [
      "Editing asks how to change a sequence; synthetic biology asks what function a system should perform.",
      "Synthetic biology often combines parts, regulation, measurement, modeling, and iteration.",
      "Neither field removes the need for safety review and responsible governance."
    ],
    analogy: "Editing is changing lines in a document; synthetic biology is designing the whole document workflow."
  },
  "design-build-test-learn": {
    title: "Design-Build-Test-Learn Cycle",
    summary: "The DBTL cycle organizes synthetic biology as an iterative learning process: propose a design, construct a version, measure behavior, and use the results to improve the next design.",
    facts: [
      "DBTL accepts that first designs rarely work perfectly.",
      "Measurement and learning are as important as construction.",
      "The cycle supports safer, more transparent decision-making when paired with review and documentation."
    ],
    analogy: "It is the engineering version of draft, prototype, test, and revise."
  },
  "parts-devices-systems": {
    title: "Parts, Devices, and Systems",
    summary: "Synthetic biology often describes designs at nested levels. Parts are functional elements, devices combine parts into a useful behavior, and systems combine devices with host context and purpose.",
    facts: [
      "This abstraction helps learners manage complexity.",
      "A part's behavior can change when moved into a new device or host.",
      "Designers use abstraction as a guide, not as a guarantee."
    ],
    analogy: "Letters form words, words form sentences, and sentences form a meaningful paragraph."
  },
  "abstraction-hierarchy": {
    title: "Abstraction Hierarchy",
    summary: "Abstraction hides lower-level details so designers can reason about larger biological functions. Braman-style method chapters emphasize that abstraction helps communication but must be checked against real biological behavior.",
    facts: [
      "Abstraction levels can include DNA, parts, devices, circuits, pathways, and whole systems.",
      "The method is useful for planning and teaching.",
      "Biological context can break assumptions made at a higher abstraction level."
    ],
    analogy: "A subway map simplifies a city so you can plan travel, but it is not the city itself."
  },
  "standardization-reuse": {
    title: "Standardization and Reusable Parts",
    summary: "Standardization aims to make biological designs easier to share, compare, and reuse. Public authority sources and textbook discussions both stress that standards support measurement and collaboration.",
    facts: [
      "Standards can describe part formats, measurements, metadata, and reporting practices.",
      "Reusable parts work best when their context and limits are documented.",
      "Standardization reduces confusion but cannot make biology perfectly predictable."
    ],
    analogy: "Standard plugs help devices connect, but the power grid and appliance still matter."
  },
  "measurement-standards-biofoundry": {
    title: "Measurement, Standards, and Biofoundries",
    summary: "Measurement, standards, and biofoundries make synthetic biology more reproducible. Public authority sources emphasize shared metrics and reporting, while teaching texts connect these ideas to DBTL and reliable design.",
    facts: [
      "Measurement turns design behavior into comparable evidence.",
      "Standards make it easier for teams to share parts, data, and expectations.",
      "Biofoundries combine automation, measurement, data handling, and iterative design."
    ],
    analogy: "Measurement and standards are the ruler, lab notebook, and shared vocabulary of biological engineering."
  },
  "sequencing-reading-dna": {
    title: "Sequencing: Reading DNA",
    summary: "Sequencing determines the order of DNA bases. In synthetic biology education, sequencing is framed as a way to read and verify genetic information, not as a design instruction by itself.",
    facts: [
      "Sequencing produces data that must be interpreted carefully.",
      "Reading DNA is different from predicting every biological effect.",
      "Genomic data raises privacy, equity, and security questions."
    ],
    analogy: "Sequencing is reading the spelling of a long biological text."
  },
  "dna-synthesis-assembly": {
    title: "DNA Synthesis and Assembly",
    summary: "DNA synthesis and assembly are high-level ways to write and combine DNA designs. Braman-style chapters include molecular assembly concepts, but this tutor keeps the discussion non-operational and focused on purpose, limits, and safety.",
    facts: [
      "Synthesis creates designed DNA sequences through specialized services or laboratory systems.",
      "Assembly combines DNA pieces into larger constructs at a conceptual level.",
      "Screening, documentation, and biosafety review are important parts of responsible DNA writing."
    ],
    analogy: "It is like composing and arranging paragraphs, while safety review checks what the document could do."
  },
  "genome-editing-concepts": {
    title: "Genome Editing Concepts",
    summary: "Genome editing refers to targeted changes in genetic material. For beginners, the key idea is the distinction between choosing a target, changing information, and evaluating biological consequences.",
    facts: [
      "Genome editing is a powerful concept but not the whole of synthetic biology.",
      "Off-target effects, delivery, cell type, and ethics matter.",
      "This project explains concepts and applications, not operational editing procedures."
    ],
    analogy: "Editing a genome is like revising a sentence inside a large, interconnected manual."
  },
  "whole-genome-synthesis": {
    title: "Whole-Genome Synthesis",
    summary: "Whole-genome synthesis studies the design and construction of very large genetic systems. It is a frontier topic that connects DNA writing, genome organization, standards, and biosecurity screening.",
    facts: [
      "Whole-genome work shows why biological design must consider system-level organization.",
      "The field raises strong governance and dual-use concerns.",
      "Educational discussion should remain conceptual and safety-aware."
    ],
    analogy: "It is closer to planning a whole operating system than changing one setting."
  },
  "genetic-code-expansion": {
    title: "Genetic Alphabet and Code Expansion",
    summary: "Genetic code expansion explores whether biological systems can use additional chemical building blocks or assign new meanings to genetic signals. It illustrates how synthetic biology asks deep questions about the design space of life.",
    facts: [
      "The standard genetic code links triplets of nucleic acid bases to amino acids.",
      "Expanding that code can support new protein chemistry in controlled research contexts.",
      "Such work requires careful containment, validation, and governance."
    ],
    analogy: "It is like adding new letters or punctuation to a language and asking what new words become possible."
  },
  "genetic-circuits": {
    title: "Genetic Circuits",
    summary: "Genetic circuits are engineered regulatory networks that process biological signals. Classic teaching examples include switches, oscillators, and logic gates, but real cells add noise, delay, burden, and context effects.",
    facts: [
      "A circuit links inputs, regulatory interactions, and outputs.",
      "Feedback can stabilize behavior or create dynamics such as oscillation.",
      "Circuit diagrams are simplified models of molecular interactions."
    ],
    analogy: "A genetic circuit is like a control panel built from cellular parts."
  },
  "operons-feedback": {
    title: "Operons, Feedback, and Regulatory Logic",
    summary: "Operons show how genes can be regulated together. Feedback loops and regulatory logic help cells maintain balance, respond to signals, and create engineered behaviors.",
    facts: [
      "Negative feedback can reduce runaway behavior.",
      "Positive feedback can help create switch-like states.",
      "Natural regulatory systems inspired many synthetic circuit designs."
    ],
    analogy: "Feedback is like a thermostat comparing the current room state with a desired state."
  },
  "logic-gates-information": {
    title: "Logic Gates and Cellular Information Processing",
    summary: "Synthetic biology can represent biological decision-making with logic ideas such as AND, OR, and NOT. Braman-style circuit discussions use these ideas to explain how cells can integrate multiple signals.",
    facts: [
      "Logic gates map combinations of inputs to outputs.",
      "Biological gates are probabilistic and context-dependent rather than perfectly digital.",
      "Logic concepts help learners reason about decision-making in cells."
    ],
    analogy: "A cellular logic gate is like a rule that says output only happens when the right signal pattern appears."
  },
  "noise-burden-context": {
    title: "Noise, Burden, and Context Dependence",
    summary: "Biological circuits run inside living cells that fluctuate, compete for resources, and respond to stress. Noise, burden, and context explain why a beautiful design diagram may not behave perfectly.",
    facts: [
      "Noise means variation among cells or over time.",
      "Burden means the design consumes cellular resources.",
      "Context dependence means the host and environment shape performance."
    ],
    analogy: "A design is not performed on an empty stage; the cell is already running a crowded show."
  },
  "rnai-synthetic-logic": {
    title: "RNAi and Synthetic Logic",
    summary: "RNA interference is one example of RNA-level regulation that can be connected to synthetic logic. The tutor treats it as a conceptual route for controlling expression, not as a procedural guide.",
    facts: [
      "RNA can regulate gene expression after transcription.",
      "RNA-level control can be combined with sensing and output modules.",
      "Medical and research applications require careful delivery, specificity, and safety evaluation."
    ],
    analogy: "RNAi is like a molecular mute button that can reduce a message before it becomes a protein."
  },
  "network-dynamics": {
    title: "Biomolecular Network Dynamics",
    summary: "Biological networks change over time. Modeling network dynamics helps students understand feedback, delays, thresholds, stability, oscillation, and adaptation.",
    facts: [
      "Dynamics describe how concentrations or activities change.",
      "The same network can behave differently under different parameter ranges.",
      "Models are useful for asking questions, not for replacing experiments and safety review."
    ],
    analogy: "A network is less like a still photo and more like a movie with rules."
  },
  "computer-simulation-cells": {
    title: "Computer Simulation of Cells",
    summary: "Computer simulations approximate cellular behavior to test ideas before physical work. Meyers-style systems discussions connect simulations to networks, pathways, and whole-cell thinking.",
    facts: [
      "Simulations depend on assumptions and data quality.",
      "They can reveal likely bottlenecks, contradictions, or sensitive variables.",
      "A useful simulation is transparent about what it leaves out."
    ],
    analogy: "A simulation is a flight simulator for biological ideas."
  },
  "bio-cad-design-language": {
    title: "Bio-CAD and Design Languages",
    summary: "Bio-CAD and biological design languages help represent parts, interactions, and system architecture. Braman-style chapters mention design language and DNAplotlib-like visualization as ways to make designs easier to communicate.",
    facts: [
      "Design languages can standardize diagrams and metadata.",
      "Visual tools help teams compare designs before construction.",
      "A diagram is not a protocol and cannot prove a design will work."
    ],
    analogy: "Bio-CAD is like architectural drawing for biological designs."
  },
  "ai-and-genomics": {
    title: "AI and Genomic Data",
    summary: "AI can help classify sequences, predict features, search literature, and support design exploration. It must be used with caution because biological datasets can be biased, incomplete, or sensitive.",
    facts: [
      "AI predictions need experimental validation and expert review.",
      "Genomic data can raise privacy and security risks.",
      "Good AI assistance should cite evidence and admit uncertainty."
    ],
    analogy: "AI is a map-reading assistant, not the terrain and not the safety officer."
  },
  "biosensors": {
    title: "Biosensors",
    summary: "Biosensors connect a biological recognition event to a measurable output. They can be used in research, health, environmental monitoring, and manufacturing when carefully designed and validated.",
    facts: [
      "A biosensor has a recognition component, a signal-processing component, and an output.",
      "Good sensing depends on specificity, sensitivity, range, and robustness.",
      "Field use requires attention to containment, false signals, and interpretation."
    ],
    analogy: "A biosensor is a molecular smoke detector with a biological recognition step."
  },
  "sensor-input-modules": {
    title: "Sensor Input Modules",
    summary: "Input modules allow a biological system to detect chemicals, light, temperature, metabolites, or other signals. The teaching focus is on what counts as an input and how inputs begin information flow.",
    facts: [
      "Inputs can come from the environment or from inside the cell.",
      "Recognition must be selective enough for the intended context.",
      "Input modules are often paired with regulatory components."
    ],
    analogy: "The input module is the system's ear, eye, or nose."
  },
  "signal-processing-output": {
    title: "Signal Processing and Output Modules",
    summary: "After sensing, a biological design must process information and produce a useful output. Outputs can be fluorescence, growth behavior, molecule production, or a therapeutic effect in regulated contexts.",
    facts: [
      "Signal processing can amplify, filter, invert, or combine inputs.",
      "Outputs must be easy to measure and meaningful for the application.",
      "Strong outputs can increase cellular burden."
    ],
    analogy: "Signal processing turns a whisper from the sensor into a clear decision."
  },
  "specificity-sensitivity": {
    title: "Specificity and Sensitivity",
    summary: "Specificity asks whether a biosensor responds to the right target, while sensitivity asks how small a target amount it can detect. Both matter for trustworthy interpretation.",
    facts: [
      "High sensitivity without specificity can create false alarms.",
      "High specificity with poor sensitivity can miss weak signals.",
      "Real samples may contain interfering substances."
    ],
    analogy: "A good sensor should hear the right voice in a noisy room."
  },
  "applications": {
    title: "Applications of Synthetic Biology",
    summary: "Synthetic biology applications include medicine, agriculture, manufacturing, materials, sensing, and research tools. The same design mindset can serve many areas, but each has different risks and governance needs.",
    facts: [
      "Applications should be judged by benefit, risk, feasibility, and public value.",
      "A promising lab result is not the same as a safe real-world product.",
      "Responsible innovation includes stakeholder engagement and oversight."
    ],
    analogy: "Synthetic biology is a toolbox; the responsible question is what problem the tool is solving."
  },
  "pathways-flux": {
    title: "Metabolic Pathways and Flux",
    summary: "Metabolic pathways are linked reactions that transform molecules. Flux describes how much material moves through a pathway, making it central to cell factory design.",
    facts: [
      "Pathways connect enzymes, substrates, products, cofactors, and regulation.",
      "Changing one step can redirect resources across the cell.",
      "Flux depends on both pathway design and host physiology."
    ],
    analogy: "A pathway is a road network, and flux is the traffic moving through it."
  },
  "microbial-cell-factories": {
    title: "Microbial Cell Factories",
    summary: "Microbial cell factories use engineered microbes to make useful products. Meyers-style application topics connect this idea to fuels, chemicals, medicines, and materials.",
    facts: [
      "A cell factory must balance product formation with cell health.",
      "Scale-up, quality control, and containment are major practical concerns.",
      "The best host depends on product type, pathway needs, and safety setting."
    ],
    analogy: "A cell factory is a living production line with its own maintenance needs."
  },
  "biofuels-chemicals-materials": {
    title: "Biofuels, Chemicals, and Materials",
    summary: "Synthetic biology can support production of fuels, commodity chemicals, specialty molecules, and materials. The educational emphasis is on pathway design and sustainability tradeoffs.",
    facts: [
      "Biological production can use renewable feedstocks in some contexts.",
      "Economic and environmental benefits depend on the whole process, not only the engineered cell.",
      "Product toxicity and metabolic burden can limit performance."
    ],
    analogy: "It is like asking a cell to run a carefully tuned workshop."
  },
  "protein-engineering": {
    title: "Protein Engineering",
    summary: "Protein engineering changes or designs proteins to improve or create functions. It connects structure, function, evolution, computation, and safety-aware validation.",
    facts: [
      "Proteins can act as enzymes, binders, sensors, structures, or regulators.",
      "Small sequence changes can have large functional effects.",
      "Predictions are useful, but function and safety require evidence."
    ],
    analogy: "Protein engineering is like reshaping a tool so it fits a task better."
  },
  "cell-free-synthetic-biology": {
    title: "Cell-Free Synthetic Biology",
    summary: "Cell-free systems use extracted or reconstructed biological machinery outside living cells. Braman-style TXTL discussions make this useful for prototyping, education, and biosensing concepts without treating it as a recipe.",
    facts: [
      "Cell-free systems can simplify some variables by removing growth and survival from the design problem.",
      "They still depend on complex biological components and careful interpretation.",
      "They can support rapid conceptual testing under appropriate supervision."
    ],
    analogy: "Cell-free biology is like taking part of the cellular workshop onto a bench for controlled study."
  },
  "minimal-genome": {
    title: "Minimal Genomes",
    summary: "Minimal genome research asks what genetic functions are necessary for life under defined conditions. It helps students think about essential genes, context, and the boundary between natural and designed systems.",
    facts: [
      "Essentiality depends on environment and organism.",
      "A minimal genome is not automatically a simple organism.",
      "The topic connects foundational biology with synthetic cell research."
    ],
    analogy: "A minimal genome is like asking what parts a vehicle needs to move in one specific setting."
  },
  "compartmentalization-synthetic-cells": {
    title: "Compartmentalization and Synthetic Cells",
    summary: "Compartmentalization creates boundaries that organize reactions and information. Synthetic cell research studies how life-like functions can emerge when components are placed inside controlled compartments.",
    facts: [
      "Membranes and compartments separate inside from outside.",
      "Compartments can concentrate molecules and control exchange.",
      "Synthetic cells are research models, not simple copies of natural life."
    ],
    analogy: "A compartment is a room that lets a tiny chemistry project have an inside and an outside."
  },
  "biomedical-synbio": {
    title: "Biomedical Applications",
    summary: "Biomedical synthetic biology includes engineered cells, diagnostics, therapeutic delivery concepts, vaccines, and regenerative medicine. It requires strong safety, ethics, and clinical oversight.",
    facts: [
      "Medical applications must consider efficacy, delivery, immune response, and patient safety.",
      "Engineering a biological function is only one part of clinical translation.",
      "Regulation and informed consent are central to responsible use."
    ],
    analogy: "Biomedical design is not only building a tool; it is fitting that tool into a human care system."
  },
  "regenerative-cell-therapy": {
    title: "Regenerative Medicine and Cell Therapy",
    summary: "Cell therapies can use living cells as treatments, while regenerative medicine aims to repair or replace damaged tissues. Synthetic biology can add sensing, control, or production functions in carefully regulated settings.",
    facts: [
      "Engineered cells can sense environments and produce responses.",
      "Safety concerns include persistence, targeting, immune effects, and unintended behavior.",
      "Clinical translation requires rigorous testing and oversight."
    ],
    analogy: "A cell therapy is a living tool that must act in the right place, at the right time, and within limits."
  },
  "vaccines-immunology-synbio": {
    title: "Vaccines and Immunology Applications",
    summary: "Synthetic biology contributes concepts and platforms for vaccine design, immune engineering, and diagnostics. The tutor keeps this at the level of principles, applications, and safeguards.",
    facts: [
      "Vaccines train immune memory through carefully evaluated platforms.",
      "Synthetic biology can help design antigens, delivery concepts, or manufacturing processes.",
      "Public trust depends on transparency, safety evidence, and clear communication."
    ],
    analogy: "A vaccine is like a training exercise for the immune system."
  },
  "dna-origami-nanostructures": {
    title: "DNA Origami and Nanostructures",
    summary: "DNA origami uses the predictable pairing of DNA bases to design nanoscale shapes and structures. It shows that DNA can be a construction material, not only genetic information.",
    facts: [
      "The concept relies on base-pairing rules and nanoscale self-assembly.",
      "Applications include research tools, materials, and delivery concepts.",
      "Educational coverage should focus on principles rather than assembly recipes."
    ],
    analogy: "DNA origami treats DNA like a programmable nanoscale folding material."
  },
  "engineered-living-materials": {
    title: "Engineered Living Materials",
    summary: "Engineered living materials combine biological activity with material properties. They may sense, self-repair, produce molecules, or respond to environments under controlled conditions.",
    facts: [
      "Living materials blur the boundary between device and organism.",
      "Containment and lifecycle management are central safety issues.",
      "The field connects synthetic biology with materials science and design."
    ],
    analogy: "A living material is like a wall, coating, or fabric that can perform biological functions."
  },
  "ethics-safety": {
    title: "Ethics, Safety, and Responsible Innovation",
    summary: "Responsible synthetic biology asks who benefits, who bears risk, how uncertainty is handled, and how decisions are governed. Ethics is part of design, not an afterthought.",
    facts: [
      "Safety includes harm prevention for people, animals, and environments.",
      "Ethics includes fairness, consent, access, and accountability.",
      "Public trust grows through transparency and meaningful engagement."
    ],
    analogy: "Ethics is the steering system that keeps technical power pointed toward public value."
  },
  "biosecurity-risk-assessment": {
    title: "Biosecurity Risk Assessment",
    summary: "Biosecurity risk assessment asks how biological knowledge or tools could be misused and how to reduce that risk. It is especially important for DNA synthesis, pathogens, toxins, and dual-use research.",
    facts: [
      "Risk assessment considers capability, intent, access, and consequence.",
      "Controls can include screening, training, review, and reporting norms.",
      "Useful education should avoid actionable harmful detail."
    ],
    analogy: "Biosecurity is like access control and threat modeling for life science."
  },
  "technology-stewardship-public-trust": {
    title: "Technology Stewardship and Public Trust",
    summary: "Technology stewardship means guiding a field through responsible choices over time. Public trust depends on openness, accountability, benefit sharing, and willingness to address concern.",
    facts: [
      "Stewardship is ongoing, not a one-time approval.",
      "Public engagement can improve problem framing and governance.",
      "Trust is earned through behavior, not slogans."
    ],
    analogy: "Stewardship is careful navigation when the map is still being drawn."
  },
  "dual-use-biosecurity": {
    title: "Dual Use and Biosecurity",
    summary: "Dual-use knowledge can support beneficial science but also create risks if misapplied. Synthetic biology education should teach students to notice this tension early.",
    facts: [
      "The same technique may enable medicine, manufacturing, or misuse.",
      "Dual-use review asks whether benefits justify risks and what safeguards are needed.",
      "Responsible communication avoids enabling harmful replication."
    ],
    analogy: "A powerful tool needs both purpose and guardrails."
  },
  "biosafety-biosecurity-difference": {
    title: "Biosafety vs. Biosecurity",
    summary: "Biosafety focuses on preventing accidental exposure or release, while biosecurity focuses on preventing misuse, theft, or deliberate harm. Both are essential for responsible life science.",
    facts: [
      "Biosafety asks how accidents are prevented.",
      "Biosecurity asks how misuse is prevented.",
      "Good governance coordinates both rather than treating them as separate worlds."
    ],
    analogy: "Biosafety is safe handling; biosecurity is secure access and misuse prevention."
  },
  "public-dialogue-responsibility": {
    title: "Public Dialogue and Responsible Innovation",
    summary: "Public dialogue helps synthetic biology align with social values and real needs. It is especially important when technologies affect health, food, environment, or community trust.",
    facts: [
      "Dialogue should happen before decisions are locked in.",
      "Different communities may define benefit and risk differently.",
      "Responsible innovation learns from public concern instead of dismissing it."
    ],
    analogy: "Public dialogue is a design review with the people who may live with the results."
  }
};

const defaultCoreTerms = {
  "foundations-life-systems": ["cell", "DNA", "RNA", "protein", "gene expression", "regulation"],
  "biology-to-engineering": ["DBTL", "abstraction", "module", "standardization", "chassis"],
  "reading-writing-dna": ["sequencing", "synthesis", "assembly", "editing", "screening"],
  "gene-regulation-circuits": ["operon", "feedback", "switch", "oscillator", "logic gate"],
  "modeling-design-tools": ["model", "simulation", "network", "CAD", "design language"],
  "biosensors-signal-processing": ["sensor", "input", "signal processing", "output", "specificity", "sensitivity"],
  "metabolic-engineering-cell-factories": ["pathway", "flux", "cell factory", "burden", "yield"],
  "cell-free-synthetic-cells": ["cell-free system", "TXTL", "minimal genome", "compartment", "synthetic cell"],
  "biomedical-frontier-applications": ["cell therapy", "vaccine", "DNA origami", "living material", "translation"],
  "safety-ethics-public-trust": ["biosafety", "biosecurity", "dual use", "governance", "public trust"]
};

const chineseAliases = {
  "synbio-definition": ["合成生物学", "定义", "工程化生命系统"],
  "synbio-vs-editing": ["合成生物学", "基因编辑", "区别"],
  "design-build-test-learn": ["设计构建测试学习", "设计", "构建", "测试", "学习", "循环"],
  "parts-devices-systems": ["生物部件", "装置", "系统", "关系"],
  "genetic-circuits": ["遗传线路", "开关", "振荡器", "逻辑门"],
  "biosensors": ["生物传感器", "核心思想", "输入", "输出"],
  "applications": ["应用", "合成生物学能做什么"],
  "ai-and-genomics": ["AI", "基因组", "数据分析", "设计"],
  "ethics-safety": ["伦理", "安全", "治理", "负责任创新"],
  "whole-genome-synthesis": ["全基因组", "合成", "前沿话题"],
  "biomedical-synbio": ["医学", "诊断", "治疗", "应用"],
  "measurement-standards-biofoundry": ["测量", "标准", "标准化", "生物铸造厂"],
  "cell-free-synthetic-biology": ["细胞自由", "无细胞", "合成生物学"],
  "protein-engineering": ["蛋白工程", "蛋白质", "合成生物学"],
  "biosecurity-risk-assessment": ["生物安保", "风险评估", "合成生物学"],
  "technology-stewardship-public-trust": ["公众信任", "技术治理", "创新"],
  "cell-basics": ["细胞", "生命系统"],
  "dna-rna-protein-flow": ["DNA", "RNA", "蛋白质", "信息流"],
  "genes-regulatory-elements": ["基因", "调控元件"],
  "gene-expression-regulation": ["基因表达", "表达调控"],
  "host-chassis": ["宿主", "底盘细胞"],
  "abstraction-hierarchy": ["抽象分层", "层级"],
  "standardization-reuse": ["标准化", "可复用部件"],
  "sequencing-reading-dna": ["测序", "读取DNA"],
  "dna-synthesis-assembly": ["DNA合成", "组装"],
  "genome-editing-concepts": ["基因组编辑", "高层概念"],
  "genetic-code-expansion": ["遗传密码", "扩展"],
  "operons-feedback": ["操纵子", "反馈", "调控逻辑"],
  "logic-gates-information": ["逻辑门", "细胞信息处理"],
  "noise-burden-context": ["噪声", "负担", "上下文依赖"],
  "network-dynamics": ["网络动态", "生物分子网络"],
  "computer-simulation-cells": ["细胞模拟", "计算模拟"],
  "bio-cad-design-language": ["生物CAD", "设计语言"],
  "sensor-input-modules": ["传感输入", "输入模块"],
  "signal-processing-output": ["信号处理", "输出模块"],
  "specificity-sensitivity": ["特异性", "灵敏度"],
  "pathways-flux": ["代谢通路", "通量"],
  "microbial-cell-factories": ["微生物", "细胞工厂"],
  "biofuels-chemicals-materials": ["燃料", "化学品", "材料"],
  "minimal-genome": ["最小基因组"],
  "compartmentalization-synthetic-cells": ["隔室化", "合成细胞"],
  "rnai-synthetic-logic": ["RNAi", "合成逻辑"],
  "regenerative-cell-therapy": ["再生医学", "细胞治疗"],
  "vaccines-immunology-synbio": ["疫苗", "免疫"],
  "dna-origami-nanostructures": ["DNA折纸", "纳米结构"],
  "engineered-living-materials": ["工程活细胞材料", "活材料"],
  "dual-use-biosecurity": ["双重用途", "生物安保"],
  "biosafety-biosecurity-difference": ["生物安全", "生物安保", "区别"],
  "public-dialogue-responsibility": ["公众对话", "责任创新"]
};

const moduleTitleById = new Map((kb.learning_path ?? []).map((module) => [module.id, module.title_en]));
const localSourceIds = new Set((kb.sources ?? []).filter((source) => source.source_tier === "local_textbook_reference").map((source) => source.id));

for (const module of kb.learning_path ?? []) {
  const meta = moduleMeta[module.id];
  if (!meta) continue;
  Object.assign(module, meta);
  module.audience = "high_school_intro";
}

for (const doc of kb.documents ?? []) {
  const entry = content[doc.id];
  if (!entry) continue;

  const moduleTitle = moduleTitleById.get(doc.module_id) ?? doc.topic ?? "Synthetic Biology";
  doc.title = entry.title;
  doc.topic = moduleTitle;
  doc.summary = entry.summary;
  doc.facts = entry.facts;
  doc.analogy = entry.analogy;
  doc.learning_objectives = [
    `Explain the main idea of ${entry.title}.`,
    `Connect ${entry.title} to the current learning module.`,
    "State one limitation or safety consideration without giving a protocol."
  ];
  doc.core_terms = defaultCoreTerms[doc.module_id] ?? ["synthetic biology", "design", "evidence"];
  doc.keywords = [
    ...new Set([
      ...entry.title.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2),
      ...(defaultCoreTerms[doc.module_id] ?? []),
      ...(chineseAliases[doc.id] ?? []),
      doc.module_id.replaceAll("-", " "),
      doc.source_tier === "local_textbook_reference" ? "textbook reference" : "public authority"
    ])
  ].slice(0, 14);
  doc.misconceptions = [
    "The concept is not a step-by-step laboratory instruction.",
    "A diagram or model does not guarantee the same behavior in every cell.",
    "Responsible design includes safety, context, and uncertainty."
  ];
  doc.student_questions = [
    `Why is ${entry.title} important in synthetic biology?`,
    `How does ${entry.title} connect to the previous module?`,
    `What is one safe real-world application or limitation of ${entry.title}?`
  ];
  doc.source_tier = (doc.source_ids ?? []).some((id) => localSourceIds.has(id)) ? "local_textbook_reference" : "public_authority";
}

fs.writeFileSync(kbPath, `${JSON.stringify(kb, null, 2)}\n`, "utf8");
