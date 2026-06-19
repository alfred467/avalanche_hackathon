const founderTemplate = {
  title: "KENYAN FOUNDER COLLABORATION & EQUITY AGREEMENT (K-FOUNDER)",
  introduction: "This Agreement governs the relationship, equity vesting, intellectual property, and roles of the Founders of the Company under the Kenyan Companies Act, 2015.",
  clauses: [
    {
      id: "founder-preamble",
      title: "Preamble & Co-Founders (Cross-Border Bridge)",
      text: "This Agreement is entered into by and between the Co-Founders (the 'Founders'): {{FOUNDER_NAMES_WITH_DETAILS}} of {{COMPANY_NAME}} (Registration No. {{REGISTRATION_NUMBER}}), hereinafter referred to as the 'Company'. This Agreement is anchored in the Constitution of Kenya (Article 32 - Freedom of Association and Article 40 - Protection of Property) and the Kenyan Companies Act, 2015, while explicitly mirroring Delaware C-Corp Founder Restricted Stock Purchase Agreements to ensure seamless compatibility with international US venture capital standards.",
      translation: "This lists the names and ID/Passport details of all the co-founders starting the business together. We state explicitly that this document is legally equivalent to US Delaware Founder Agreements, making it easy for foreign investors to read and trust.",
      kenyanLawNote: "Provides the legal identity of each party under the Kenyan Companies Act, 2015 and protects property rights under Article 40 of the Constitution. Bridges local structure with US Delaware Restricted Stock standards."
    },
    {
      id: "founder-commitment",
      title: "1. Role, Commitment & Side-Hustles",
      text: "Each Founder agrees to dedicate at least {{WEEKLY_HOURS}} hours per week to the business of the Company. No Founder shall engage in any other business activity, employment, or 'side-hustle' that competes with the Company or distracts from their primary duties, unless declared in Schedule A and approved in writing by all other Founders.",
      translation: "Every founder must commit to working at least {{WEEKLY_HOURS}} hours a week on this startup. You cannot run a competing business or take a second job (side-hustle) that distracts you, unless everyone agrees beforehand in writing.",
      kenyanLawNote: "Addresses the high prevalence of concurrent business ventures (side-hustles) in Kenya, ensuring that the startup gets the founders' primary focus."
    },
    {
      id: "founder-vesting",
      title: "2. Vesting of Shares & Power of Attorney Escrow",
      text: "Founder shares shall vest over a period of {{VESTING_YEARS}} years with a {{CLIFF_MONTHS}}-month cliff, vesting monthly thereafter. In the event a Founder departs the Company (voluntary or involuntary) before full vesting, the unvested shares shall be repurchased by the Company or remaining Founders at a nominal value of 1 KES per share. To execute this, each Founder hereby grants an irrevocable Limited Power of Attorney to the Company Secretary (CPS) to execute the share transfer forms (Form CR18) and board resolutions on their behalf.",
      translation: "You don't own all your equity on Day 1. It is earned over {{VESTING_YEARS}} years. If you leave early, the company buys back your unvested shares for just 1 KES. To make this easy, you sign a Power of Attorney giving the Company Secretary permission to transfer your unvested shares back to the company if you leave, so you can't block the company by refusing to sign.",
      kenyanLawNote: "Crucial Kenyan workaround. Form CR18 (Transfer of Shares) filed on eCitizen normally requires the signatures of both transferor and transferee. A pre-signed Power of Attorney held by the Company Secretary makes reverse vesting practical and enforceable without litigation."
    },
    {
      id: "founder-ip-assignment",
      title: "3. Comprehensive Intellectual Property Assignment",
      text: "Each Founder hereby assigns to the Company all right, title, and interest in and to any and all ideas, code, designs, algorithms, domain names, patents, and copyrights created by them, whether before or after the signing of this agreement, relating to the Company's business. Founders shall execute all documents necessary to register such IP under the company's name at the Kenya Industrial Property Institute (KIPI) or Kenya Copyright Board (KECOBO).",
      translation: "Any code, design, or brand asset you create for the startup belongs to the startup, not to you personally. You must sign the papers to register these assets with the official Kenyan IP registries under the company's name.",
      kenyanLawNote: "Covers intellectual property transfer in accordance with the Kenya Copyright Act (Cap 130) and Industrial Property Act, 2001."
    },
    {
      id: "founder-noncompete",
      title: "4. Post-Employment Non-Compete & Non-Solicit",
      text: "Upon departure from the Company for any reason, a Founder shall not engage in, advise, or invest in any business that competes directly with the Company within East Africa for a period of {{NONCOMPETE_MONTHS}} months. Further, the departing Founder shall not solicit any employees, contractors, or customers of the Company.",
      translation: "If you leave, you cannot start or join a competitor in East Africa for {{NONCOMPETE_MONTHS}} months, and you cannot hire away the company's team members or steal its clients.",
      kenyanLawNote: "Under Kenyan common law, covenants in restraint of trade (non-competes) must be reasonable in geography (e.g., East Africa) and duration (e.g., 6–12 months) to be enforceable in court."
    },
    {
      id: "founder-dispute",
      title: "5. Alternative Dispute Resolution (Med-Arb - International Aligned)",
      text: "Any dispute among Founders regarding this Agreement, shares, or roles shall be resolved through mediation. If mediation fails within 10 days, the matter shall be referred to final and binding arbitration in Nairobi under the United Nations Commission on International Trade Law (UNCITRAL) Arbitration Rules and the Kenyan Arbitration Act, Cap 49. The parties waive their right to appeal to the high court. The award shall be enforceable globally under the New York Convention.",
      translation: "If founders have a dispute, they must resolve it via mediation or a fast-track arbitration in Nairobi using international rules. Founders agree not to take each other to local court, saving time, money, and ensuring the ruling is respected internationally.",
      kenyanLawNote: "Designed under the Kenyan Arbitration Act and the New York Convention to keep shareholder disputes private, swift, and internationally enforceable, preventing public court filings."
    }
  ]
};

if (typeof module !== 'undefined') {
  module.exports = founderTemplate;
}

// Kenyan Equity Legal Framework - Phase 1 - K-FOUNDER Template definition with vesting and power of attorney clauses
