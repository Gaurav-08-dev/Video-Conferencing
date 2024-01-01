import '@/styles/globals.css'
import { SocketProvider } from '@/context/socket.js';

export default function App({ Component, pageProps }) {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  )
}
