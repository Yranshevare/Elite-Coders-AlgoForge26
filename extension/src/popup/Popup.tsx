import { useEffect, useState } from 'react';
import { fetchSession, sendOtp, verifyOtp, storeToken } from '../utils/auth';

export default function Popup() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'verified'>('idle');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await fetchSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          setStatus('verified');
          setMessage(`Logged in as ${session.user.email}`);
        }
      } catch {
        // ignore, not logged in
      }
    })();
  }, []);

  const handleSendOtp = async () => {
    if (!email) {
      setMessage('Please type your email first.');
      return;
    }

    setIsLoading(true);
    setMessage('Sending OTP...');

    try {
      await sendOtp(email);
      setStatus('sent');
      setMessage('OTP sent to your email. Check inbox/spam.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      setMessage('Email and OTP are required.');
      return;
    }

    setIsLoading(true);
    setMessage('Verifying OTP...');

    try {
      const result = await verifyOtp(email, otp);
      if (result?.token) {
        await storeToken(result.token);
      }
      setStatus('verified');
      setUserEmail(email);
      setMessage('OTP verified. You are logged in.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id='my-ext' className='container' data-theme='light'>
      <h2>Extension Auth</h2>
      {status === 'verified' ? (
        <div>
          <p className='text-success'>Logged in as: {userEmail}</p>
        </div>
      ) : (
        <>
          <div className='form-control'>
            <label className='label' htmlFor='email'>
              Email
            </label>
            <input
              id='email'
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='input input-bordered'
            />
          </div>
          <button
            className='btn btn-primary mt-2'
            onClick={handleSendOtp}
            disabled={isLoading}
          >
            Send OTP
          </button>

          {status === 'sent' && (
            <>
              <div className='form-control mt-2'>
                <label className='label' htmlFor='otp'>
                  OTP
                </label>
                <input
                  id='otp'
                  type='text'
                  placeholder='123456'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className='input input-bordered'
                />
              </div>
              <button
                className='btn btn-secondary mt-2'
                onClick={handleVerifyOtp}
                disabled={isLoading}
              >
                Verify OTP
              </button>
            </>
          )}
        </>
      )}

      <p className='mt-2'>{message}</p>
    </div>
  );
}
