export default function Background() {
    return (
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[#09090b]">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[130px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[130px]" />
        </div>
    );
}
