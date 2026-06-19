import UrlShortener from '../components/UrlShortner';

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
        Shorten Links <br />
        <span className="text-blue-600">With a Click</span>
      </h1>
      <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
        Paste in any long url, make it sharable, trackable and customizable with just a few clicks.
        <span className="block text-sm text-gray-400 mt-1">
          [Tip: Click advanced options]
        </span>
      </p>
      <div className="mt-8 max-w-xl mx-auto">
        <UrlShortener />
      </div>
    </div>
  );
};

export default Home;