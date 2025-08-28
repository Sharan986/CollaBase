import React from 'react';
import { Link, Navigate } from 'react-router-dom'; // Add Navigate import
import { useAuth } from '../contexts/AuthContext';

function LandingPage() {
  const { currentUser, userProfile } = useAuth();

  // Redirect to dashboard if already logged in
  if (currentUser && userProfile) {
    return <Navigate to="/dashboard" replace />;
  }

    const projectImages = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9kZWxzfGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1683849117195-83517b362436?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D",
  "https://images.unsplash.com/photo-1595435757684-8bdd368d1cfc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEwfHx8ZW58MHx8fHx8",
  "https://plus.unsplash.com/premium_photo-1668638806497-ad6d6c198e02?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE2fHx8ZW58MHx8fHx8",
  "https://images.unsplash.com/photo-1627488051629-b9a20b87b9f0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDMzfHx8ZW58MHx8fHx8",
  "https://images.unsplash.com/photo-1621525205234-474337268a26?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIzfHx8ZW58MHx8fHx8",
];
  return (
    <>
    
      <div className="flex w-full h-screen items-center justify-between max-w-6xl mx-auto p-5">
      {/* Text Content Section */}
      <div className="flex-1 p-5">
        <h1 className="text-7xl font-bold text-gray-800 mb-4">
         ARKA JAIN<br /> University 
        </h1>
        <p className="text-lg text-gray-600 mb-6">
           one of the leading state private Universities in the Eastern region of the country and the first state private University in the entire Kolhan Region comprising of the three districts of East Singhbhum, West Singhbhum and Saraikela-Kharsawan.
        </p>
        <div className="flex gap-4">
          <button className="bg-black text-white px-6 py-3 rounded-md font-medium">
            Explore
          </button>
          <button className=" border-2 border-black px-6 py-3 rounded-md font-medium flex items-center gap-2">
            Create Team
          </button>
        </div>
      </div>

      {/* Image with Inline CSS 3D Tilt */}
      <div className="flex-1 relative flex justify-center items-center">
        <img
          src="https://imgs.search.brave.com/Sqt6wGi3r4ptes3Qw92U8B7mSyOHgNIW2t1vjbv4WYM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hcmth/amFpbnVuaXZlcnNp/dHkuYWMuaW4vd3At/Y29udGVudC91cGxv/YWRzLzIwMTgvMDgv/TG9nby5qcGc"
          alt="Person holding books"
          className="w-72 h-72 rounded-full object-cover shadow-lg"
          style={{
            transition: "transform 0.3s ease-out",
            transformStyle: "preserve-3d",
            transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "perspective(1000px) rotateX(10deg) rotateY(10deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
          }}
        />
      </div>
    </div>

    // Projects 
    <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-10">
            <h2 className="text-center text-3xl font-bold mb-12">Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 place-items-center mb-16">
              {projectImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="w-80 h-80 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <img
                    src={imageUrl}
                    alt={`Project ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Link to="/teams">
                <button className="px-10 cursor-pointer py-4 rounded-lg hover:bg-gray-300 transition-colors bg-gray-200 text-lg font-medium">
                  Load More
                </button>
              </Link>
            </div>
          </div>
        </div>
        </>
  );
}

export default LandingPage;