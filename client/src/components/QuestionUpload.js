import React, { useState } from 'react';
import axios from 'axios';
import '../styles/QuestionUpload.css';

export default function QuestionUpload() {
  const [selectedQuestionType, setSelectedQuestionType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    image: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Define category options for each question type
  const categoryOptions = {
    aptitude: [
      'ac1',
      'ac2',
      'ac3',
      'ac4',
      'ac5',
      'ac6',
      'ac7',
      'ac8',
      'ac9',
      'ac10'
    ],
    verbal: [
      'vc1',
      'vc2',
      'vc3',
      'vc4',
      'vc5',
      'vc6',
      'vc7',
      'vc8',
      'vc9',
      'vc10'
    ],
    programming: [
      'pc1',
      'pc2',
      'pc3',
      'pc4',
      'pc5',
      'pc6',
      'pc7',
      'pc8',
      'pc9',
      'pc10',
      'pc11'
    ],
    core: [
      'cs',
      'it',
      'ec',
      'ee',
      'mech',
      'civil',
      'chem',
      'bio',
      'aids',
      'auto',
      'marine'
    ] 
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewQuestion({...newQuestion, image: e.target.files[0]});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let endpoint = '';
      switch(selectedQuestionType) {
        case 'aptitude':
          endpoint = 'aptitude-questions';
          break;
        case 'verbal':
          endpoint = 'verbal-questions';
          break;
        case 'programming':
          endpoint = 'programming-questions';
          break;
        case 'core':
          endpoint = 'core-questions';
          break;
        default:
          throw new Error('Please select a question type');
      }

      const formData = new FormData();
      formData.append('question', newQuestion.question);
      formData.append('category', selectedCategory);
      newQuestion.options.forEach((option, index) => {
        formData.append(`options[${index}]`, option);
      });
      formData.append('correctAnswer', newQuestion.correctAnswer);
      if (newQuestion.image) {
        formData.append('image', newQuestion.image);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOSTNAME}/api/${endpoint}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        setSuccess('Question added successfully!');
        setNewQuestion({
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          image: null
        });
        setSelectedCategory('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding question');
    }
  };

  return (
    <div className='container'>
      {/* <h1 className='title text-light'>Upload Questions</h1> */}

      <form onSubmit={handleSubmit} className="question-form">
        {/* Question Type Selection */}
        <div className="form-group">
          <select 
            value={selectedQuestionType}
            onChange={(e) => {
              setSelectedQuestionType(e.target.value);
              setSelectedCategory('');
            }}
            required
            className="select-input"
          >
            <option value="">Select Question Type</option>
            <option value="aptitude">Aptitude</option>
            <option value="verbal">Verbal</option>
            <option value="programming">Programming</option>
            <option value="core">Core</option>
          </select>
        </div>

        {/* Category Selection */}
        {selectedQuestionType && (
          <div className="form-group">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              className="select-input"
            >
              <option value="">Select Category</option>
              {categoryOptions[selectedQuestionType].map((category) => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Question Input */}
        <div className="form-group">
          <textarea
            placeholder="Enter question"
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
            required
            className="question-input"
          />
        </div>

        {/* Options Input */}
        {newQuestion.options.map((option, index) => (
          <div key={index} className="form-group">
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...newQuestion.options];
                newOptions[index] = e.target.value;
                setNewQuestion({...newQuestion, options: newOptions});
              }}
              required
              className="option-input"
            />
          </div>
        ))}

        {/* Correct Answer Selection */}
        <div className="form-group">
          <select
            value={newQuestion.correctAnswer}
            onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: Number(e.target.value)})}
            required
            className="select-input"
          >
            <option value="">Select Correct Answer</option>
            {newQuestion.options.map((_, index) => (
              <option key={index} value={index}>Option {index + 1}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="file-input-label">
            Add Image (Optional)
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
          </label>
          {newQuestion.image && (
            <div className="image-preview">
              <img 
                src={URL.createObjectURL(newQuestion.image)} 
                alt="Question preview" 
                style={{ maxWidth: '200px', marginTop: '10px' }}
              />
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="submit-btn">
          Add Question
        </button>
      </form>
    </div>
  );
}
