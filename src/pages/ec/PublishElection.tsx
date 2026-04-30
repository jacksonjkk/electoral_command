import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { supabase } from '@/services/supabase';
import { ballotService } from '@/services/ballot';
import { Button, Card, Alert, Loading, EmptyState, Input } from '@/components/UI';
import { Copy, Eye, Check, User } from 'lucide-react';

export const PublishElection: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Fetch election details
  const { data: election, isLoading: electionLoading } = useQuery(
    ['election', electionId],
    async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId!)
        .single();

      if (error) throw error;
      return data;
    }
  );

  // Fetch ballot
  const { data: ballot, isLoading: ballotLoading } = useQuery(
    ['ballot', electionId],
    () => ballotService.getBallot(electionId!),
    { enabled: !!electionId }
  );


  const ballotLink = `${window.location.origin}/ballot/${electionId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(ballotLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (electionLoading || ballotLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!ballot || ballot.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          title="No Positions Yet"
          message="Add positions and candidates before publishing this election"
          action={{
            label: 'Back to Manager',
            onClick: () => navigate(`/ec/elections/${electionId}`),
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Publish Election
        </h1>
        <p className="text-gray-600">
          {election?.title} - Share the ballot link with voters
        </p>
      </div>

      {/* Shareable Link */}
      <Card className="p-6 border-2 border-green-200 bg-green-50 shadow-neon-success">
        <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-widest">Voting Link</h2>
        <p className="text-gray-600 mb-4">
          Copy and share this link with voters. They can vote immediately by entering
          their @kab.ac.ug email.
        </p>

        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={ballotLink}
            readOnly
            className="bg-white"
          />
          <Button
            onClick={handleCopyLink}
            variant={copied ? 'success' : 'secondary'}
            className="flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-[24px] border border-green-200">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">
            Share via:
          </p>
          <div className="flex gap-4 md:gap-6 mt-2 flex-wrap">
            {/* Email */}
            <button 
              onClick={() => window.open(`mailto:?subject=Vote Now&body=Click here to vote: ${ballotLink}`, '_blank')}
              className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all hover:-translate-y-1 shadow-lg border border-primary-500/20"
              title="Share via Email"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 12.713L.622 6.072C.21 5.83.003 5.417.001 5.006L0 4.001c.002-.553.447-1 1-1h22c.553 0 .998.447 1 1l-.001 1.005c-.002.411-.209.824-.621 1.066L12 12.713zm0 2.029l11.378-6.641c.39-.228.621-.611.622-1.026v10.93c0 .553-.447 1-1 1h-22c-.553 0-1-.447-1-1v-10.93c.001.415.232.798.622 1.026L12 14.742z"/>
              </svg>
            </button>

            {/* WhatsApp */}
            <button 
              onClick={() => window.open(`https://wa.me/?text=Vote now: ${ballotLink}`, '_blank')}
              className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all hover:-translate-y-1 shadow-lg border border-[#25D366]/20"
              title="Share via WhatsApp"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793 0-.853.448-1.273.607-1.446.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.101-.177.211-.077.383.1.173.444.735.95 1.185.65.58 1.2.76 1.37.846.171.086.271.07.371-.044.103-.114.444-.52.564-.694.12-.174.241-.145.405-.087.163.058 1.04.49 1.214.577.174.087.289.13.332.202.045.075.045.433-.1.839zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.017 21.671c-1.747 0-3.453-.469-4.933-1.356l-3.541.93 1.011-3.689c-1.107-1.634-1.742-3.612-1.741-5.557 0-5.341 4.347-9.688 9.69-9.688 2.587 0 5.018 1.006 6.848 2.837s2.836 4.261 2.836 6.848c-.001 5.344-4.349 9.688-9.69 9.688z"/>
              </svg>
            </button>

            {/* Twitter / X */}
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=Vote now&url=${ballotLink}`, '_blank')}
              className="w-12 h-12 rounded-2xl bg-black/5 text-black flex items-center justify-center hover:bg-black hover:text-white transition-all hover:-translate-y-1 shadow-lg border border-black/10"
              title="Share via X (Twitter)"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
              </svg>
            </button>
          </div>

          {/* Hidden Icon Attribution for Compliance */}
          <div className="mt-4 opacity-0 pointer-events-none h-0 overflow-hidden">
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-[8px] text-gray-500">
              <a href="https://www.flaticon.com/free-icons/brands-and-logotypes" title="brands and logotypes icons">Brands and logotypes icons created by Freepik - Flaticon</a>
              <a href="https://www.flaticon.com/free-icons/whatsapp" title="whatsapp icons">Whatsapp icons created by Indygo - Flaticon</a>
              <a href="https://www.flaticon.com/free-icons/email" title="email icons">Email icons created by Uniconlabs - Flaticon</a>
            </div>
          </div>
        </div>
      </Card>

      {/* Election Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-1">Total Roles</p>
          <p className="text-3xl font-bold text-gray-900">{ballot.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-1">Election Type</p>
          <p className="text-xl font-bold text-success-600">Public Enrollment</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-600 text-sm">Status</p>
          <p className="text-3xl font-bold text-blue-600 capitalize">
            {election?.status}
          </p>
        </Card>
      </div>

      {/* Ballot Preview */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">Voter View Preview</h2>
        </div>
        <p className="text-gray-600 mb-6">
          This is how voters will see the ballot:
        </p>

        <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
          {ballot.map((item, idx) => (
            <div key={item.position.id} className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {idx + 1}. {item.position.name}
              </h3>
              {item.position.description && (
                <p className="text-gray-600 text-sm mb-4">
                  {item.position.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex flex-col border-2 border-gray-200 rounded-xl overflow-hidden hover:bg-gray-50 transition"
                  >
                    {candidate.image_url ? (
                      <div className="w-full h-48 bg-gray-100">
                        <img
                          src={candidate.image_url}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="p-4 flex items-start gap-3">
                      <input
                        type="radio"
                        name={item.position.id}
                        className="mt-1 w-4 h-4"
                        disabled
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {candidate.name}
                        </h4>
                        {candidate.manifesto && (
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                            {candidate.manifesto}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate(`/ec/elections/${electionId}`)}
          className="flex-1 !rounded-2xl"
        >
          Back to Election Manager
        </Button>
        <Button
          onClick={() => navigate('/ec')}
          className="flex-1"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};
