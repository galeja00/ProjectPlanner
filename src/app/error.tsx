'use client'


export default function Error({ error, reset } : { error : Error & { digest?: string }, reset : () => void}) {
    return (
        <div className="bg-neutral-950 rounnded p-4 m-auto flex justify-center flex-col gap-4">
          <h2>An error ocurred: {error.message}</h2>
          <button className="btn-primary" onClick={() => reset()}>Try again</button>
        </div>
      )
}