'use client'


export default function Error({ error, reset } : { error : Error & { digest?: string }, reset : () => void}) {
    return (
        <div className="w-full h-screen flex align-middle justify-center">
          <div className="bg-neutral-200 rounded p-4 m-auto flex justify-center flex-col gap-4  w-1/3 mt-auto">
            <h2>An error ocurred: {error.message}</h2>
            <button className="btn-primary" onClick={() => reset()}>Try again</button>
          </div>
        </div>
      )
}