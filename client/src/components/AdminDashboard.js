import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [searchEmail, setSearchEmail] = useState(''); // Search email instead of regNo
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const searchUser = async () => {
    if (!searchEmail) {
      setError('Please enter an email to search'); // Ensure the check is for email
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Send the email as the query parameter in the GET request
      const response = await axios.get('http://localhost:5000/api/users/search', {
        params: { email: searchEmail }
      });

      if (response.data) {
        setUserData(response.data); // Store the user data if found
      } else {
        setError('User not found'); // Show error if user not found
        setUserData(null);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error searching for user'); // Show error message
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetTest = async (email) => {
    if (window.confirm('Are you sure you want to reset this user\'s test?')) {
      try {
        await axios.post('http://localhost:5000/api/users/reset-test', { email });
        alert('Test reset successfully');
        searchUser(); // Trigger the search again after resetting the test
      } catch (error) {
        alert('Error resetting test: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  return (
    <div className='container'>
      <h1 className='title text-light'>Admin Dashboard</h1>

      <div className="search-section">
        <input
          type="email" // Use email input for better validation
          placeholder="Search by Email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)} // Update the email state
          className="search-input"
        />
        <button 
          onClick={searchUser} 
          className="search-btn"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {userData && (
        <div className="user-details">
          <h2>User Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <strong>Name:</strong> {userData.name}
            </div>
            <div className="detail-item">
              <strong>Email:</strong> {userData.email}
            </div>
            <div className="detail-item">
              <strong>Registration Number:</strong> {userData.regNo}
            </div>
            <div className="detail-item">
              <strong>Department:</strong> {userData.department}
            </div>
            <div className="detail-item">
              <strong>Status:</strong>
              <span className={`status-${userData.status}`}>
                {userData.status === 'not_started' ? 'Not Started' : 'Completed'}
              </span>
            </div>

            {userData.status === 'completed' && (
              <div className="detail-item">
                <strong>Score:</strong> {userData.score}
              </div>
            )}

            {userData.status !== 'not_started' && (
              <div className="detail-item">
                <button 
                  onClick={() => handleResetTest(userData.email)} // Pass the email for resetting the test
                  className="reset-btn"
                >
                  Reset Test
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}





// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import '../styles/AdminDashboard.css';

// export default function AdminDashboard() {
//   const [searchRegNo, setSearchRegNo] = useState('');
//   const [userData, setUserData] = useState(null);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const searchUser = async () => {
//     if (!searchRegNo) {
//       setError('Please enter a registration number to search');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError('');
      
//       const response = await axios.get(`http://localhost:5000/api/users/search`, {
//         params: { regNo: searchRegNo }
//       });
      
//       if (response.data) {
//         setUserData(response.data);
//       } else {
//         setError('User not found');
//         setUserData(null);
//       }
//     } catch (error) {
//       setError(error.response?.data?.message || 'Error searching for user');
//       setUserData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResetTest = async (email) => {
//     if (window.confirm('Are you sure you want to reset this user\'s test?')) {
//       try {
//         await axios.post(`http://localhost:5000/api/users/reset-test`, { email });
//         alert('Test reset successfully');
//         searchUser();
//       } catch (error) {
//         alert('Error resetting test: ' + (error.response?.data?.message || 'Unknown error'));
//       }
//     }
//   };

//   return (
//     <div className='container'>
//       <h1 className='title text-light'>Admin Dashboard</h1>
      
//       <div className="search-section">
//         <input
//           type="text"
//           placeholder="Search by Registration Number"
//           value={searchRegNo}
//           onChange={(e) => setSearchRegNo(e.target.value)}
//           className="search-input"
//         />
//         <button 
//           onClick={searchUser} 
//           className="search-btn"
//           disabled={loading}
//         >
//           {loading ? 'Searching...' : 'Search'}
//         </button>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {userData && (
//         <div className="user-details">
//           <h2>User Details</h2>
//           <div className="details-grid">
//             <div className="detail-item">
//               <strong>Name:</strong> {userData.name}
//             </div>
//             <div className="detail-item">
//               <strong>Registration Number:</strong> {userData.regNo}
//             </div>
//             <div className="detail-item">
//               <strong>Email:</strong> {userData.email}
//             </div>
//             <div className="detail-item">
//               <strong>Department:</strong> {userData.department}
//             </div>
//             <div className="detail-item">
//               <strong>Status:</strong> 
//               <span className={`status-${userData.status}`}>
//                 {userData.status === 'not_started' ? 'Not Started' : 'Completed'}
//               </span>
//             </div>
            
//             {userData.status === 'completed' && (
//               <div className="detail-item">
//                 <strong>Score:</strong> {userData.score}
//               </div>
//             )}

//             {userData.status !== 'not_started' && (
//               <div className="detail-item">
//                 <button 
//                   onClick={() => handleResetTest(userData.regNo)}
//                   className="reset-btn"
//                 >
//                   Reset Test
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
