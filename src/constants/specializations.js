/**
 * SVARP LMS - Curated Specializations and Areas of Expertise Dataset
 * Used across instructor registration, course categorization, and instructor profiles.
 */

export const SPECIALIZATION_DOMAINS = [
  {
    category: "Software Engineering & Web Development",
    icon: "Code",
    areas: [
      "Full Stack Web Development (React, Node.js, Python)",
      "Frontend Architecture & Modern JavaScript (React, Vue, Next.js)",
      "Backend Engineering & Distributed Systems (Python, Go, Java)",
      "Mobile Application Development (Flutter, React Native, iOS, Android)",
      "API Engineering, REST & GraphQL Architectures",
      "Systems Programming (Rust, C++, Embedded)",
      "Software Testing, QA Automation & CI",
    ],
  },
  {
    category: "Cloud Computing, DevOps & Infrastructure",
    icon: "Cloud",
    areas: [
      "Multi-Cloud Architecture (AWS, Azure, Google Cloud)",
      "DevOps, Containerization & Orchestration (Docker, Kubernetes)",
      "Infrastructure as Code & Automation (Terraform, Ansible)",
      "Linux System Administration & Networking",
      "Site Reliability Engineering (SRE) & Observability",
      "Serverless & Microservices Architectures",
    ],
  },
  {
    category: "Artificial Intelligence, Data Science & ML",
    icon: "Cpu",
    areas: [
      "Generative AI, Large Language Models (LLMs) & Prompting",
      "Applied Machine Learning & Deep Learning (PyTorch, TensorFlow)",
      "Data Science & Predictive Modeling (Python, Pandas, Scikit-Learn)",
      "Data Engineering & Big Data Pipelines (Spark, Kafka, Airflow)",
      "Computer Vision & Natural Language Processing (NLP)",
      "Business Intelligence, Analytics & Data Visualization (PowerBI, Tableau)",
    ],
  },
  {
    category: "Cybersecurity & Information Defense",
    icon: "Shield",
    areas: [
      "Ethical Hacking, Penetration Testing & Bug Bounty",
      "Network Defense, Cryptography & Security Operations (SOC)",
      "Cloud & Application Security (AppSec / DevSecOps)",
      "Cyber Threat Intelligence & Digital Forensics",
      "Information Security Governance, Risk & Compliance (GRC)",
    ],
  },
  {
    category: "UI/UX Design & Product Strategy",
    icon: "Layout",
    areas: [
      "UI/UX Design, Prototyping & Wireframing (Figma)",
      "Product Management, Agile, Scrum & Product Roadmaps",
      "Design Systems & Visual Interaction Design",
      "User Research, Usability Testing & Information Architecture",
    ],
  },
  {
    category: "Business, Finance & Digital Strategy",
    icon: "Briefcase",
    areas: [
      "Digital Marketing, SEO & Growth Strategy",
      "Financial Analysis, FinTech & Quantitative Modeling",
      "Entrepreneurship, Startup Leadership & Scaling",
      "Project Management (Agile, PMP, Scrum Master)",
    ],
  },
  {
    category: "Emerging Technologies",
    icon: "Zap",
    areas: [
      "Blockchain, Smart Contracts & Web3 Development",
      "Internet of Things (IoT) & Embedded Hardware",
      "Game Design & 3D Interactive Environments (Unity, Unreal)",
      "Robotics, Autonomous Systems & Automation",
    ],
  },
];

// Flat array of all specializations for quick lookups and search
export const ALL_SPECIALIZATIONS = SPECIALIZATION_DOMAINS.flatMap((d) => d.areas);

export const DEFAULT_SPECIALIZATION = SPECIALIZATION_DOMAINS[0].areas[0];
