'use client'


export default function Error({ error, reset } : { error : Error & { digest?: string }, reset : () => void}) {
    return (
        <div className="w-full h-screen flex align-middle justify-center">
          <div className="bg-neutral-950 rounded p-4 m-auto flex justify-center flex-col gap-4 w-fit mt-auto">
            <h2>An error ocurred: {error.message}</h2>
            <button className="btn-primary" onClick={() => reset()}>Try again</button>
          </div>
        </div>
      )
}