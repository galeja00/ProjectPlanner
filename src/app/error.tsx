'use client'


export default function Error({ error, reset } : { error : Error & { digest?: string }, reset : () => void}) {
    return (
        <div>
          <h2>An error ocurred: {error.message}</h2>
          <button onClick={() => reset()}>Try again</button>
        </div>
      )
}