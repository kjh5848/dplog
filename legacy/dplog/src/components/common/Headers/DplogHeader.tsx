export default function DplogHeader({ title, message }: { title: string, message: string }) {
  return (
    <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white shadow-lg">
      <h1 className="text-3xl leading-tight font-bold">
        <span className="bg-clip-text text-white">{title}</span>
        <br className="block md:hidden" />
        <span className="md:ml-2">{message}</span>
      </h1>
    </div>
  );
} 