const Slide = ({ slide, recap }) => {
  switch (slide) {
    case 0:
      return (
        <SlideWrapper title="Your Writing and Collabortive Year 2025 ✨">
         <h1>Hi {recap.user.name}</h1>
         <img src={recap.user.photo} alt="User Avatar" className="w-16 h-16 mt-2  rounded-full mx-auto mb-4 bg-white" />
         <h2>Here's your 2025 writing recap!</h2>
          <p>
            You wrote total {" "}
            <span className="font-semibold">
              {recap.writing.totalLetters}
            </span>{" "}
            workspaces documents in 2025.
          </p>
        </SlideWrapper>
      );

    case 1:
      return (
        <SlideWrapper title="You Went Public 🌍">
          <p>
            <span className="font-semibold">
              {recap.writing.publicLetters}
            </span>{" "}
            workspaces were published with the world.
          </p>
        </SlideWrapper>
      );

    case 2:
      return (
        <SlideWrapper title="Viewers Arrived 👀">
          <p>
            Your public workspaces received{" "}
            <span className="font-semibold">
              {recap.impact.totalViews}
            </span>{" "}
            total visits.
          </p>
          <p>
            Your most viewed workspace was{" "}
            <span className="font-semibold text-blue-400">
              {recap.impact.mostViewedLetter
                ? recap.impact.mostViewedLetter.title
                : "N/A"}
                </span>{" "}
                with{" "}
                <span className="font-semibold text-blue-400">
                {recap.impact.mostViewedLetter.views}
                </span>{" "}
                visits.
          </p>
          <button className="mt-4 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors" onClick={() => {
            if (recap.impact.mostViewedLetter) {
              window.open(recap.impact.mostViewedLetter.link, "_blank");
            }}}>
            View Export
          </button>
        </SlideWrapper>
      );

    case 3:
      return (
        <SlideWrapper title="Where It Began 🕊️">
          <p>
            Your first workspace document was saved on{" "}
            {new Date(recap.activity.firstLetterDate).toDateString()}
          </p>
        </SlideWrapper>
      );

    case 4:
      return (
        <SlideWrapper title="Keep Learning and Documenting ✍️">
            <h1>
            Thank you for being part of RTEX!
            </h1>
            <h2>
                Keep writing, keep sharing, and keep inspiring
                collaboratively.
            </h2>

            <h1 className="text-blue-500 mt-4 cursor-pointer" onClick={()=>{
                window.open(
                    "https://rtex.vercel.app","_blank"
                )
            }}>RTEX</h1>
            <h1 className="text-blue-500 mt-2 cursor-pointer" onClick={()=>{
                window.open(
                    "https://rtex-expo.vercel.app","_blank"
                )
            }}>RTEX-Expo</h1>

        </SlideWrapper>
      );

    default:
      return null;
  }
};

const SlideWrapper = ({ title, children }) => {
  return (
    <div className="max-w-xl text-center">
      <h1 className="text-3xl font-semibold mb-4">{title}</h1>
      <div className="text-lg opacity-90">{children}</div>
    </div>
  );
};

export default Slide;