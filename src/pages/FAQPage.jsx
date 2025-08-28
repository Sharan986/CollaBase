import React, { useState } from 'react';

const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "What is CollaBase?",
      answer: "CollaBase is a collaborative platform designed for ARKA JAIN University students to form teams, work on projects, and participate in competitions like Smart India Hackathon (SIH). It helps students connect based on skills, interests, and project requirements."
    },
    {
      id: 2,
      question: "How do I create a team?",
      answer: "To create a team, navigate to the 'SIH' section from the navbar or click 'Create Team' from your dashboard. Fill in your project details, required skills, team size, and other relevant information. Once submitted, your team will be visible to other students who can apply to join."
    },
    {
      id: 3,
      question: "How can I join an existing team?",
      answer: "Browse available teams in the 'Projects' section. Click on any team that interests you to view detailed information. If your skills match their requirements and they have open positions, click 'Apply to Join' and submit your application with a brief message about why you'd be a good fit."
    },
    {
      id: 4,
      question: "What information do I need to complete my profile?",
      answer: "Your profile should include your name, year of study, branch/department, technical skills, areas of interest, and any relevant experience. A complete profile helps team leaders understand your capabilities and increases your chances of being selected."
    },
    {
      id: 5,
      question: "How do team applications work?",
      answer: "When you apply to join a team, the team leader receives your application with your profile information and any message you've included. They can review your skills and decide whether to accept or decline your application. You'll be notified of their decision through the platform."
    },
    {
      id: 6,
      question: "Can I be part of multiple teams?",
      answer: "While you can apply to multiple teams, it's generally recommended to focus on one main project to ensure quality contribution. Check with your team leaders about their expectations regarding commitment and availability."
    },
    {
      id: 7,
      question: "What is the Smart India Hackathon (SIH)?",
      answer: "Smart India Hackathon is a nationwide initiative to provide students with a platform to solve some of the pressing problems we face in our daily lives. It aims to harness the creativity and technical expertise of students to develop innovative solutions for various government and industry challenges."
    },
    {
      id: 8,
      question: "How do I manage my team after creation?",
      answer: "Team leaders can manage their teams through the 'My Teams' section. This includes reviewing applications, accepting/declining team members, updating team information, and tracking the team's progress. You can also communicate with team members and coordinate project activities."
    },
    {
      id: 9,
      question: "What types of projects can I create or join?",
      answer: "CollaBase supports various project categories including Web Applications, Mobile Apps, AI/ML projects, Data Science, Gaming, IoT, Blockchain, and other innovative technology solutions. Projects can range from academic assignments to competition entries like SIH."
    },
    {
      id: 10,
      question: "How do I update my skills and interests?",
      answer: "You can update your profile information, including skills and interests, by visiting your Profile page. Click on your name in the navbar dropdown and select 'Profile' to edit your information. Keeping your profile updated helps you get matched with relevant opportunities."
    },
    {
      id: 11,
      question: "What should I do if I'm having technical issues?",
      answer: "If you're experiencing technical issues, try refreshing the page or clearing your browser cache first. If the problem persists, you can report the issue to the platform administrators through the contact information provided by your university's IT department."
    },
    {
      id: 12,
      question: "Are there any guidelines for team collaboration?",
      answer: "Yes, we encourage respectful communication, active participation, and professional conduct. Team members should be committed to their projects, communicate regularly, and contribute meaningfully to team goals. Always maintain academic integrity and respect intellectual property rights."
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about using CollaBase for team collaboration and project management
          </p>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/50 transition-all duration-200"
              >
                <h3 className="text-lg font-semibold text-slate-800 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                      openFAQ === faq.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {openFAQ === faq.id && (
                <div className="px-6 pb-5 border-t border-white/20">
                  <div className="pt-4">
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Still have questions?
            </h3>
            <p className="text-slate-600 mb-6">
              Can't find the answer you're looking for? Contact your university's IT support team for additional assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@arkajainuniversity.ac.in"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Support
              </a>
              <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                User Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
