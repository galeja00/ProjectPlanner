import { useReducer, useState, DragEvent, useRef, ChangeEvent } from "react"

export default function DropImage({ closeDrop } : { closeDrop : () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isOver, toggleOver] = useReducer(isOver => !isOver ,false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleDragOver(e : DragEvent) {
        e.preventDefault();
        if (!isOver) {
            toggleOver();
        }
        
    }

    async function updateImage(image : File) {
        try {
            const res = await fetch("/api/users/acc/image", {
                method: "POST",
                body: JSON.stringify({
                    image: image
                })
            });
            if (res.ok) {
                closeDrop();
            }
            const data = await res.json();
            setErrorMsg(data.error);
        }
        catch (error) {
            console.error(error);
        }
    }

    function submitFile(file : File) {
        if (file.type == "image/png" || file.type == "image/jpeg") {
            updateImage(file);
        } 
        else {
            setErrorMsg("Unsupported file format");
        }
    }

    function handleDrop(e : DragEvent) {
        e.preventDefault();
        setFile(e.dataTransfer.files[0]);
        if (file) {
            submitFile(file);
        }
    }

    function handleDragExit(e : DragEvent) {
        e.preventDefault();
        if (isOver) {
            toggleOver();
        }
    }

    function handleSelect(e : ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if (e.target.files) {
            setFile(e.target.files[0]);
            if (file) {
                submitFile(file);
            }
        }
    }

    return (
        <div className="w-full h-full bg-neutral-950 bg-opacity-80 absolute z-50 flex justify-center items-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragExit}
            onDrop={handleDrop}
        >
            <div className={` w-64 h-64 ${isOver ? "bg-violet-600" : "bg-neutral-900"} rounded flex justify-center items-center p-2`}>
                <div className="w-full h-full border border-dashed rounded flex flex-col justify-center items-center">
                    <div>Drop Image <div>Or</div></div>
                    <input type="file" title="" accept="image/png, image/jpeg" hidden ref={inputRef}
                        onChange={handleSelect}
                    />
                    <button onClick={() => inputRef.current?.click()} className="btn-primary">Select Image</button>
                </div>
                <p className="text-red-500">{errorMsg}</p>
            </div>
        </div>
    )
}