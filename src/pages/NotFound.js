export default () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-wrap m-0">
                <div className="w-full md:w-1/2">
                    <img src="https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569__340.jpg" className="max-w-full h-auto" />
                </div>
                <div className="w-full md:w-1/2 flex flex-col self-center">
                    <p className="text-[1.75rem]">
                        {" "}
                        <span className="text-red-500">Opps!</span> Page not found.
                    </p>
                    <p className="text-xl font-light">The page you're looking for doesn't exist.</p>
                    <a href="/Memo2" className="inline-flex items-center justify-center px-3 py-1.5 rounded cursor-pointer text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700">
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
};
