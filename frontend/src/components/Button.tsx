export const Button = ({onClick , children}: {onClick:()=>void,children: React.ReactNode})=>{
    return <button onClick={onClick} className="p-8 py-4 text-2xl bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        {children}
    </button>
}