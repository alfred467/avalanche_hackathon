const safeTemplate = {
  title: "KENYAN SIMPLE AGREEMENT FOR FUTURE EQUITY (K-SAFE)",
  introduction: "This Agreement is entered into under the laws of the Republic of Kenya (specifically the Companies Act, 2015) between the Company and the Investor.",
  clauses: [
    {
      id: "safe-preamble",
      title: "Preamble & Parties (Cross-Border Bridge)",
      text: "This K-SAFE is issued by {{COMPANY_NAME}} (Registration No. {{REGISTRATION_NUMBER}}), a private limited company incorporated in Kenya (the 'Company'), to {{INVESTOR_NAME}} (the 'Investor') in exchange for the payment of {{INVESTMENT_AMOUNT}} (the 'Purchase Amount') on or about {{INVESTMENT_DATE}}. This instrument is drafted in direct compatibility with the United States Delaware General Corporation Law (DGCL) SAFE framework and the International Chamber of Commerce (ICC) standards, while being fully anchored in the Constitution of Kenya (Article 40 - Protection of Right to Property) and the Kenyan Companies Act, 2015.",
      translation: "This is the cover page showing who is involved. The investor pays the startup {{INVESTMENT_AMOUNT}} now, in exchange for shares later. We explicitly state this document bridges US (Delaware) and Kenyan law, meaning a foreign investor can trust it just like an American SAFE.",
      kenyanLawNote: "Governed by the Kenyan Companies Act, 2015 and constitutionally protected by Article 40. Legally bridges Delaware C-Corp mechanics for seamless foreign direct investment (FDI)."
    },
    {
      id: "safe-conversion",
      title: "1. Conversion upon Equity Financing",
      text: "Upon the occurrence of an Equity Financing round of at least {{QUALIFIED_ROUND_AMOUNT}} KES, the Company shall automatically issue to the Investor a number of Ordinary/Preference Shares equal to the Purchase Amount divided by the Conversion Price. The Conversion Price shall be the lower of (a) the price per share of the shares sold in the Equity Financing, or (b) the Valuation Cap of {{VALUATION_CAP}} KES divided by the Company's fully diluted capitalization.",
      translation: "When the company raises a major funding round of at least {{QUALIFIED_ROUND_AMOUNT}} KES, the investor's money automatically converts into shares. The price they pay per share is discounted, capped by the Valuation Cap of {{VALUATION_CAP}} KES. This rewards the early investor for taking high risk.",
      kenyanLawNote: "Unlike US SAFEs, conversion in Kenya must be executed as an 'allotment of new shares' by the directors (Form CR2 filed on eCitizen). Stamp duty of 1% is payable on the nominal value of the shares plus share premium, which must be factored into the conversion math."
    },
    {
      id: "safe-salary-cap",
      title: "2. Anti-Siphoning: Founder Salary Cap",
      text: "Until this K-SAFE converts into equity or is terminated, the monthly gross salary, consulting fees, or any other cash compensation paid to each Founder (including {{FOUNDER_NAMES}}) shall not exceed {{FOUNDER_SALARY_CAP}} KES, unless approved in writing by the Investor or a majority of SAFE Holders.",
      translation: "Founders cannot pay themselves massive salaries from the investor's money. Their monthly pay is strictly capped at {{FOUNDER_SALARY_CAP}} KES. This keeps the money focused on building the product.",
      kenyanLawNote: "Avoids the common loophole where founders route investor cash straight into their personal bank accounts under the guise of 'directors' fees' or 'market salaries'."
    },
    {
      id: "safe-related-party",
      title: "3. Related-Party Transaction Control",
      text: "The Company shall not enter into any contract, purchase agreement, lease, or service contract with any Founder, shareholder, relative of a Founder, or any corporate entity in which a Founder or shareholder holds a beneficial interest, without the prior written approval of the Investor. Any contract executed in violation of this clause shall be void ab initio.",
      translation: "Founders cannot hire their own side-companies, spouses, or relatives to do work for the startup using the investor's money without asking first. If they do it anyway, the contract is illegal, and the money must be returned.",
      kenyanLawNote: "Protects against 'transfer pricing' and siphoning funds to shadow companies owned by founders, a frequent issue in early-stage ecosystems where litigation is slow."
    },
    {
      id: "safe-dual-sig",
      title: "4. M-Pesa & Bank Dual Signatory Trigger",
      text: "For any single transaction, payment, or transfer from the Company's bank accounts or M-Pesa Till/Paybill accounts exceeding {{SIGNATORY_THRESHOLD}} KES, the approval of both a Founder representative and the Investor's appointed financial observer (or joint-signatory) shall be required. Split transactions designed to bypass this limit are strictly prohibited.",
      translation: "If the company wants to pay more than {{SIGNATORY_THRESHOLD}} KES in one go (via bank or M-Pesa), the transaction must be authorized by both the founder and the investor. This prevents a single founder from running away with the treasury overnight.",
      kenyanLawNote: "M-Pesa Business Tills are highly liquid in Kenya. Dual authorization on Till portals (such as Safaricom's M-Pesa Org portal) is required to secure business cash."
    },
    {
      id: "safe-ip-lockbox",
      title: "5. Intellectual Property Lockbox",
      text: "All intellectual property, including codebases, designs, patents, and trademarks created by the Founders or employees for the startup, must be assigned to and owned solely by the Company. Any transfer, licensing, or pledging of the Company's Intellectual Property to any third party (including founders' personal projects) requires 100% investor approval.",
      translation: "The startup owns all the technology. Founders cannot take the code, logo, or patents and launch a different company under a different name if things get tough. The tech stays in the company.",
      kenyanLawNote: "Aligns with the Kenya Industrial Property Act and Copyright Act. Prevents founders from moving IP out of the company to render the investor's equity worthless."
    },
    {
      id: "safe-personal-guarantee",
      title: "6. Personal Fraud Guarantee (Corporate Veil)",
      text: "In the event that a Founder siphons funds, commits material fraud, or willfully misapplies company funds in violation of Clauses 2, 3, or 4 of this Agreement, the limited liability protection of the Founder shall be waived. The Founder shall be personally, jointly and severally liable to refund the Purchase Amount directly to the Investor.",
      translation: "Warning: If you steal or siphon the investor's money, you lose your corporate protection. The investor can sue you personally and go after your personal property (cars, land, houses) to get their money back.",
      kenyanLawNote: "While limited liability is protected under the Companies Act 2015, this contract creates a personal, civil indemnity (guarantee) by the founders, bypassing the need to prove fraud in sluggish criminal courts."
    },
    {
      id: "safe-dispute-resolution",
      title: "7. Fast-Track Med-Arb (International Law Aligned)",
      text: "Any dispute arising out of this Agreement shall first be referred to mediation before a single mediator. If unresolved within 10 days, the dispute shall be referred to final arbitration under the United Nations Commission on International Trade Law (UNCITRAL) Arbitration Rules and the Kenyan Arbitration Act, Cap 49. The arbitration shall take place in Nairobi, Kenya, be conducted in English, and conclude within 20 days. The award shall be final and enforceable internationally under the New York Convention.",
      translation: "If there is a fight, we do not go to slow local courts. We use international arbitration rules (UNCITRAL). If the arbitrator makes a ruling, it can be enforced not just in Kenya, but globally (like in the US or UK) under the New York Convention.",
      kenyanLawNote: "Enforceable under the Kenyan Arbitration Act (Cap 49) and internationally via the New York Convention. Bypasses the mainstream judiciary for swift foreign and local enforcement."
    }
  ]
};

if (typeof module !== 'undefined') {
  module.exports = safeTemplate;
}

// Kenyan Equity Legal Framework - Phase 1 - K-SAFE Template definition with anti-siphoning and Kenyan law clauses
