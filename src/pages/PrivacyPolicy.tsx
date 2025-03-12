
import React from "react";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | MyBirdieBoard</title>
        <meta name="description" content="MyBirdieBoard's Privacy Policy - Learn how we protect and handle your data" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto prose prose-slate">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: 3rd March 2025</p>
          
          <p>Welcome to MyBirdieBoard! Your privacy is important to us, and we are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.</p>
          
          <p>By using MyBirdieBoard, you agree to the collection and use of information in accordance with this policy.</p>
          
          <h2 className="text-2xl font-semibold mt-8">1. Information We Collect</h2>
          <p>When you use MyBirdieBoard, we may collect the following types of information:</p>
          
          <h3 className="text-xl font-semibold mt-4">A. Personal Information</h3>
          <ul>
            <li>Account details: First name, last name, username, email address.</li>
            <li>Subscription details: Payment information (processed securely via Stripe — we do not store your payment details).</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-4">B. Golf Data</h3>
          <ul>
            <li>Round information: Scores, courses played, dates of rounds, and any other data you input about your golf game.</li>
            <li>Leaderboard data: Your scores and rankings on course leaderboards.</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-4">C. Usage Data</h3>
          <p>Information about how you use MyBirdieBoard, such as pages visited, time spent on the platform, and interactions with features.</p>
          
          <h3 className="text-xl font-semibold mt-4">D. Device Information</h3>
          <p>IP address, browser type, and device type used to access MyBirdieBoard.</p>
          
          <h2 className="text-2xl font-semibold mt-8">2. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li>To provide and improve our service: Ensure MyBirdieBoard works as expected and enhance user experience.</li>
            <li>To manage your account: Process sign-ups, subscriptions, and payments.</li>
            <li>To display leaderboards: Show your scores and rankings in course leaderboards.</li>
            <li>To communicate with you: Send important updates about your account, new features, or promotional content (you can opt out anytime).</li>
            <li>To analyze platform performance: Monitor user activity to improve functionality and design.</li>
            <li>To comply with legal obligations: Ensure we meet applicable laws and regulations.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8">3. How We Share Your Information</h2>
          <p>We do not sell or rent your personal data. We may share your data only in the following cases:</p>
          <ul>
            <li>With service providers: Such as Stripe for secure payment processing.</li>
            <li>With legal authorities: If required by law or to protect our rights and safety.</li>
            <li>With your consent: If you agree to share specific data.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8">4. Data Security</h2>
          <p>We take data security seriously and use industry-standard measures to protect your information. This includes encryption, secure server hosting, and restricted access to personal data.</p>
          <p>However, please remember that no method of online transmission is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.</p>
          
          <h2 className="text-2xl font-semibold mt-8">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your data: Request a copy of the personal data we hold about you.</li>
            <li>Correct your data: Update any incorrect or incomplete information.</li>
            <li>Delete your account: You can request account deletion by contacting us.</li>
            <li>Opt-out of marketing emails: Unsubscribe at any time by clicking the "unsubscribe" link in our emails.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8">6. Data Retention</h2>
          <p>We retain your personal data for as long as you have an active account. If you cancel your subscription or request deletion, we will remove your data, unless legally required to keep it.</p>
          
          <h2 className="text-2xl font-semibold mt-8">7. Third-Party Links</h2>
          <p>MyBirdieBoard may contain links to third-party websites. We are not responsible for the privacy practices of these sites and encourage you to review their policies.</p>
          
          <h2 className="text-2xl font-semibold mt-8">8. Changes to This Privacy Policy</h2>
          <p>We may update this policy from time to time. Any changes will be posted here, and we'll notify you of significant updates via email or through the platform.</p>
          
          <h2 className="text-2xl font-semibold mt-8">9. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us via:</p>
          <p><a href="https://facebook.com/mybirdieboard" target="_blank" rel="noopener noreferrer">facebook.com/mybirdieboard</a></p>
          
          <p className="text-muted-foreground mt-12">Last updated: 3rd March 2025</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
