import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button } from '@/components/UI';
import { Shield, Zap, Globe, Lock, ArrowRight, Fingerprint, Activity, Terminal, Mail, MessageSquare, Send } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'ec_admin';

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/40 backdrop-blur-md rounded-full border border-white/20 shadow-xl mb-8">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Next-Gen Voting System Active</span>
          </div>
          
          <div className="flex justify-center mb-8 md:mb-12">
            <div className="w-24 h-24 md:w-36 md:h-36 bg-white rounded-[32px] md:rounded-[48px] flex items-center justify-center shadow-2xl overflow-hidden border-2 border-white ring-8 ring-primary-500/5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-gray-900 mb-6 md:mb-8 tracking-tighter leading-none uppercase">
            Electoral <span className="text-primary-600">Command</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            A fast and secure way to vote in your official elections. Your vote is private and fully protected.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
            <Button
              onClick={() => navigate('/vote')}
              size="lg"
              className="px-6 md:px-10 py-4 md:py-6 !rounded-[20px] md:!rounded-[24px] shadow-neon-primary text-xs md:text-sm font-black"
            >
              Start Voting
              <Zap className="w-4 md:w-5 h-4 md:h-5 ml-2 md:ml-3" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(isAdmin ? '/ec' : '/ec/login')}
              className="px-6 md:px-10 py-4 md:py-6 !rounded-[20px] md:!rounded-[24px] border-2 border-gray-100 text-xs md:text-sm font-black"
            >
              {isAdmin ? 'Go to Dashboard' : 'Admin Login'}
              <Terminal className="w-4 h-4 md:w-5 md:h-5 ml-2 md:ml-3" />
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {[
            { icon: Lock, title: 'Secure', desc: 'Your votes are private and fully protected.', color: 'primary' },
            { icon: Fingerprint, title: 'Verified', desc: 'Login with your official student email.', color: 'accent-cyan' },
            { icon: Activity, title: 'Real-time', desc: 'Track election progress as it happens.', color: 'success' },
            { icon: Globe, title: 'Institution-wide', desc: 'Accessible to all authorized students.', color: 'blue' }
          ].map((feature, i) => (
            <Card key={i} className="group hover:-translate-y-2 md:hover:-translate-y-4 transition-all duration-500 !p-8 md:!p-10 border-2 border-transparent hover:border-primary-500/20">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] bg-white shadow-xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 md:w-8 h-6 md:h-8 text-primary-600" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2 md:mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">{feature.desc}</p>
            </Card>
          ))}
        </div>

        {/* Protocol Visualizer */}
        <Card className="relative overflow-hidden !p-0 rounded-[32px] md:rounded-[48px] border-2 md:border-4 border-white shadow-2xl">
          <div className="flex flex-col lg:flex-row items-stretch">
            <div className="lg:w-1/2 p-8 md:p-16 space-y-8 md:space-y-10">
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight uppercase">
                How it <br />
                <span className="text-primary-600">Works</span>
              </h2>
              
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Initialize Election', desc: 'Create and configure the election event with strict dates and registration rules.' },
                  { step: '02', title: 'Onboard Candidates', desc: 'Define electoral positions and add candidate profiles with names and images.' },
                  { step: '03', title: 'Authorize Voters', desc: 'Securely upload voter lists and send unique access links to authorized emails.' },
                  { step: '04', title: 'Monitor & Publish', desc: 'Track live voter turnout and officially publish final results for public view.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 mb-1 tracking-tight">{item.title}</h4>
                      <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 bg-gray-900 relative overflow-hidden flex items-center justify-center p-12 md:p-20 min-h-[300px] md:min-h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-transparent" />
              <div className="relative z-10 text-center">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 md:border-8 border-primary-500/20 flex items-center justify-center animate-glow mb-6 md:mb-8">
                   <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 md:border-8 border-primary-500/40 flex items-center justify-center">
                     <Shield className="w-10 md:w-16 h-10 md:h-16 text-primary-500" />
                   </div>
                </div>
                <p className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.4em] animate-pulse">System is Online</p>
              </div>
              
              {/* Grid Lines */}
              <div className="absolute inset-0 opacity-10" 
                   style={{backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px'}} />
            </div>
          </div>
        </Card>

        {/* Contact Us Section */}
        <section className="mt-32 mb-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight uppercase mb-4">
                  Get in <span className="text-primary-600">Touch</span>
                </h2>
                <p className="text-lg text-gray-500 font-medium leading-relaxed">
                  Have questions about the voting system or need technical support? Our team is here to help you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl group hover:border-primary-500/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-neon-primary group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Us</p>
                    <p className="font-bold text-gray-900">support@axonlabs.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl group hover:border-accent-cyan/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-accent-cyan flex items-center justify-center text-white shadow-neon-cyan group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Live Chat</p>
                    <p className="font-bold text-gray-900">Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="!p-8 md:!p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                    <input 
                      type="text" 
                      placeholder="Your Name"
                      className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 focus:border-primary-500 outline-none transition-all font-bold text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      type="email" 
                      placeholder="Your Email"
                      className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 focus:border-primary-500 outline-none transition-all font-bold text-gray-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                  <textarea 
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 focus:border-primary-500 outline-none transition-all font-bold text-gray-900 resize-none"
                  ></textarea>
                </div>
                <Button fullWidth className="!py-4 !rounded-2xl shadow-neon-primary">
                  Send Message
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
};
