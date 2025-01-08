import Chat from '@/components/Chat'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col">
        <Chat />
      </div>
    </main>
  )
}
