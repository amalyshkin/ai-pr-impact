import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="container mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo and Company Info */}
                    <div className="flex flex-col items-start">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-xl">AI</span>
                            </div>
                            <h3 className="text-xl font-bold">AI PR Impact</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Empowering businesses with AI-driven PR impact analysis and e-commerce solutions.
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div className="flex flex-col items-start">
                        <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                        <div className="space-y-2 text-gray-300">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <a href="mailto:contact@aiprimpact.com" className="hover:text-blue-400 transition-colors">
                                    contact@aiprimpact.com
                                </a>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                                </svg>
                                <a href="https://www.aiprimpact.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                    www.aiprimpact.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-start">
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <div className="space-y-2 text-gray-300">
                            <a href="#" className="block hover:text-blue-400 transition-colors">About Us</a>
                            <a href="#" className="block hover:text-blue-400 transition-colors">Services</a>
                            <a href="#" className="block hover:text-blue-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="block hover:text-blue-400 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; 2024 AI PR Impact. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
