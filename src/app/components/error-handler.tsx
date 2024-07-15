"use client"

import { ButtonWithText } from "./other"

type ErrorInfo = {
    msg : string,
    repeatFunc : () => void
}

function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    } else {
        return 'An unknown error occurred' ;
    }
}

export function ErrorBoundary({ children, error, repeatFunc }: { children: React.ReactNode; error: unknown | null; repeatFunc: () => void }) {
    const extractedError = error ? extractErrorMessage(error) : null;

    if (!extractedError) {
        return <>{children}</>;
    }

    const errorInfo: ErrorInfo = { msg: extractedError, repeatFunc };

    return (
        <>
            {children}
            <ErrorPopUp error={errorInfo} />
        </>
    );
}

function ErrorPopUp({ error }: { error: ErrorInfo }) {
    return (
        <div className="fixed bottom-0 right-0 mb-4 mr-4 bg-red-600 bg-opacity-40 border border-red-600 text-red-600 p-4 rounded  space-y-4">
            <p>{error.msg}</p>
            <div className="w-full flex justify-end">
                <ButtonWithText text="Try again" handle={error.repeatFunc} type="primary" />
            </div>
            
        </div>
    );
}

