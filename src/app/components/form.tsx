

export function FormItem({ item, type, name, correct } : { item : string, type: string, name : string, correct : null | boolean }) {
    var inputClass = "input-primary";
    if (correct == false) {
        inputClass = "input-faild";
    }
    return (
        <div className='flex flex-col'>
            <label>{item}</label>
            <input type={type} name={name} className={inputClass}></input>
        </div>
    )
}

export function SubmitButton() {
    return (
        <div className='w-fit m-auto'>
            <button className='btn-primary' type="submit">Create Account</button>
        </div>
    )
}