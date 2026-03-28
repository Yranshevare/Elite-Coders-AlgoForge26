import { useEffect, useState } from 'react';
import { fetchSession, sendOtp, verifyOtp } from '../utils/auth';

export default function SidePanel() {
  const [status, setStatus] = useState<string>('Ready');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [authStatus, setAuthStatus] = useState<'unknown' | 'logged-out' | 'otp-sent' | 'logged-in'>('unknown');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const session = await fetchSession();
        if (session?.user?.email) {
          setAuthStatus('logged-in');
          setMessage(`Logged in as ${session.user.email}`);
        } else {
          setAuthStatus('logged-out');
        }
      } catch (error) {
        setAuthStatus('logged-out');
      }
    })();
  }, []);

  const handleSendOtp = async () => {
    if (!email) {
      setMessage('Please provide email address');
      return;
    }

    setIsLoading(true);
    setMessage('Sending OTP...');

    try {
      await sendOtp(email);
      setAuthStatus('otp-sent');
      setMessage('OTP sent. Check your email and enter it below.');
    } catch (error) {
      setMessage((error as Error).message);
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
      if (result?.success) {
        setAuthStatus('logged-in');
        setMessage('OTP verified. You are now logged in.');
      } else {
        setMessage('OTP verification failed.');
      }
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractEmail = async () => {
    setIsLoading(true);
    setStatus('Extracting...');

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        setStatus('Error: No active tab');
        setIsLoading(false);
        return;
      }

      // Send message to content script to extract email details
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'extractEmailDetails'
      });

      if (response.success) {
        setStatus('✅ Email details logged to console!');
      } else {
        setStatus('❌ Failed to extract email');
      }
    } catch (error) {
      setStatus('❌ Error: Make sure you are on Gmail');
      console.error('Error:', error);
    }

    setIsLoading(false);
  };

  return (
    <div id='my-ext-sidebar' className='h-full w-full bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 flex flex-col'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-2'>📧 Gmail Extractor</h2>
        <p className='text-sm text-gray-600 dark:text-gray-300'>Extract email details to console</p>
      </div>

      {authStatus !== 'logged-in' ? (
        <div className='bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md mb-4'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-3'>Login to continue</h3>
          <div className='form-control mb-2'>
            <label className='label' htmlFor='sideEmail'>
              Email
            </label>
            <input
              id='sideEmail'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type='email'
              className='input input-bordered'
              placeholder='you@example.com'
              disabled={isLoading}
            />
          </div>

          <button
            className='btn btn-primary w-full mb-3'
            onClick={handleSendOtp}
            disabled={isLoading || authStatus === 'otp-sent'}
          >
            {isLoading && authStatus === 'logged-out' ? 'Sending OTP...' : 'Send OTP'}
          </button>

          {authStatus === 'otp-sent' && (
            <>
              <div className='form-control mb-2'>
                <label className='label' htmlFor='sideOtp'>
                  Enter OTP
                </label>
                <input
                  id='sideOtp'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type='text'
                  className='input input-bordered'
                  placeholder='123456'
                  disabled={isLoading}
                />
              </div>
              <button
                className='btn btn-secondary w-full'
                onClick={handleVerifyOtp}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          )}

          <p className='text-sm text-red-500 mt-2'>{message}</p>
        </div>
      ) : null}

      {authStatus === 'logged-in' ? (
        <>
          <div className='flex-1 space-y-4'>
            <div className='bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md'>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-3'>Email Details</h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>Click the button below to extract the currently selected email details (sender, subject, content) and log them to the browser console.</p>
              
              <button
                type='button'
                onClick={handleExtractEmail}
                disabled={isLoading}
                className='w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200'
              >
                {isLoading ? 'Extracting...' : '📋 Extract Email Details'}
              </button>

              <div className='mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md'>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>Status:</p>
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{status}</p>
              </div>
            </div>

            <div className='bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md'>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-3'>How to Use</h3>
              <ol className='text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside'>
                <li>Open an email in Gmail</li>
                <li>Click "Extract Email Details" button</li>
                <li>Open browser console (F12)</li>
                <li>View the extracted data</li>
              </ol>
            </div>
          </div>
        </>
      ) : null}

      <div className='mt-6 pt-4 border-t border-gray-200 dark:border-gray-600'>
        <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>© 2026 Gmail Extractor</p>
      </div>
    </div>
  );
}
