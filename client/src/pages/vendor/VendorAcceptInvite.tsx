import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { CheckCircle, XCircle, Loader2, Building2 } from "lucide-react";

export default function VendorAcceptInvite() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
  }, []);

  const { data: inviteInfo, isLoading: inviteLoading, error: inviteError } = trpc.vendors.getInviteByToken.useQuery(
    { token: token! },
    { enabled: !!token }
  );

  const acceptInvite = trpc.vendors.acceptInvite.useMutation({
    onSuccess: () => {
      setAccepted(true);
      setTimeout(() => setLocation("/vendor"), 2500);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a121e] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invite Link</h1>
          <p className="text-slate-400 text-sm">This invite link is missing a token. Please check the link you received.</p>
        </div>
      </div>
    );
  }

  if (inviteLoading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0a121e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen bg-[#0a121e] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Invite Error</h1>
          <p className="text-slate-400 text-sm">{inviteError.message}</p>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-[#0a121e] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Procure.parts!</h1>
          <p className="text-slate-400 text-sm">Your supplier account is now active. Redirecting to your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a121e] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-xl font-bold text-white tracking-tight mb-1">
            PROCURE<span className="text-blue-500">.</span>PARTS
          </div>
          <p className="text-slate-500 text-sm">Supplier Portal Invitation</p>
        </div>

        <div className="bg-[#0f1a2e] border border-blue-900/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-semibold">{inviteInfo?.internalAlias}</div>
              <div className="text-xs text-slate-500 capitalize">{inviteInfo?.vendorType} · {inviteInfo?.region || "Global"}</div>
            </div>
          </div>

          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            You have been invited to join <strong className="text-white">Procure.parts</strong> as a verified supplier.
            Accept this invitation to access your vendor portal and start receiving sourcing requests.
          </p>

          {inviteInfo?.expiresAt && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-6">
              <p className="text-xs text-amber-400">
                This invite expires on {new Date(inviteInfo.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 mb-4">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {user ? (
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-3 text-sm">
                <span className="text-slate-500">Accepting as: </span>
                <span className="text-white font-medium">{user.name}</span>
              </div>
              <button
                onClick={() => acceptInvite.mutate({ token: token! })}
                disabled={acceptInvite.isPending}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {acceptInvite.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
                ) : (
                  "Accept Invitation & Activate Account"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 text-center">You need to sign in with your Manus account to accept this invitation.</p>
              <a
                href={getLoginUrl(`/vendor/accept-invite?token=${token}`)}
                className="block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm text-center transition-colors"
              >
                Sign In to Accept Invitation
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Procure.parts · Imperial MEA General Trading LLC
        </p>
      </div>
    </div>
  );
}
