//Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { useSpeechRecognition } from 'react-speech-recognition';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';
import { FiSend, FiMic, FiLogOut } from 'react-icons/fi';
import './Chat.css';

const isGreeting = (input) => {
  return /^(hi|hello|hey|greetings?|good\s(morning|afternoon|evening))/i.test(input.trim());
};

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const bottomRef = useRef(null);

  // Scroll to bottom on new message/loading
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getStudentData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("User email:", user?.email);

    // Admin case
      if (user?.email === "admin@gmail.com") {
    setIsAdmin(true);

    const { data: students, error } = await supabase
      .from('students')
      .select('*');

    console.log("Admin fetch response:", { students, error });

    if (error) throw error;
    // if (!students || students.length === 0) throw new Error("No students found for admin.");
    
    setAllStudents(students);
    return;
  }

    // Parent case
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('parent_email', user.email);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No student found");
    if (data.length > 1) throw new Error("Multiple students found");

    setStudent(data[0]);

  } catch (error) {
    console.error("DATA ERROR:", error);
    alert(`ERROR: ${error.message}\nCheck Supabase data`);
    await supabase.auth.signOut();
  }
};


  useEffect(() => {
    getStudentData();
  }, []);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      resetTranscript();
    }
  }, [transcript]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!student && !isAdmin) {
      alert('Data not loaded!');
      return;
    }

    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      if (isGreeting(input)) {
        const greeting = isAdmin 
          ? "Hello Administrator! How can I assist you with school data?"
          : `Hello! How can I assist you with ${student.name}'s information?`;
          
        setMessages(prev => [...prev, { role: 'assistant', content: greeting }]);
        return;
      }

      // Construct full conversation history
      const history = messages.slice(-4).map(m => ({ role: m.role, content: m.content }));
      
      let systemMessage;
      if (isAdmin) {
        systemMessage = {
          role: 'system',
          content: `You are a school administrator assistant. Follow these rules STRICTLY:
                    1. Provide comprehensive school-wide insights
                    2. Compare student performance across classes
                    3. Identify trends in attendance, behavior, health issues
                    4. NEVER share personal contact information
                    5. For suggestions, provide actionable advice at school level
                    
                    Student Data (ALL STUDENTS):
                    ${JSON.stringify(allStudents)}`
        };
      } else {
        systemMessage = {
          role: 'system',
          content: `You are a senior student assistant and consultant. Follow these rules STRICTLY:
                    1. NEVER share student ID, parent email, or full data structure
                    2. Only provide specific information when explicitly asked
                    3. For greetings, respond politely without student data
                    4. If asked for suggestions, provide brief actionable advice based on student data
                    5. For comparisons, analyze both marks, attendance and other student data if required.
                    6. Understand variations: "mids" = midterm, "finals" = final
                    7. For suggestions, analyze student data then give suggestions

                    Student Data (ONLY use when directly relevant):
                    ${JSON.stringify({
                      id: student.id,
                      parent_email: student.parent_email,
                      name: student.name,
                      gender: student.gender,
                      class: student.class,
                      section: student.section,
                      attendance: student.attendance,
                      marks: student.marks,
                      behavior: student.behavior,
                      extracurricular: student.extracurricular,
                      health_issues: student.health_issues
                    })}`
        };
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [systemMessage, ...history, { role: 'user', content: input }],
          temperature: 0.7
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error?.message || 'API request failed');
      }

      const botMessage = responseData.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: botMessage }]);

    } catch (error) {
      console.error('Full Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="chat-container">
      <header className="chat-header gradient-header">
        <h1>{isAdmin ? "Administrator Portal" : "Student Assistant"}</h1>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => supabase.auth.signOut()}>
            <FiLogOut /> Logout
          </button>
          {!isAdmin && student && (
            <PDFDownloadLink
              document={<ReportPDF student={student} />}
              fileName="report.pdf"
              className="btn btn-alt"
            >
              Export PDF
            </PDFDownloadLink>
          )}
        </div>
      </header>

      {isAdmin && allStudents.length > 0 && (
        <div className="admin-banner">
          Access to <strong>{allStudents.length}</strong> student records
        </div>
      )}

      <main className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`bubble ${msg.role}`}>
            <div
              className="bubble-content"
              dangerouslySetInnerHTML={{
                __html: msg.content.replace(/\n/g, '<br/>')
              }}
            />
            <span className="bubble-role">
              {msg.role === 'user' ? 'You' : (isAdmin ? 'Admin Bot' : 'Assistant')}
            </span>
          </div>
        ))}
        {loading && <div className="bubble assistant">Thinking...</div>}
        <div ref={bottomRef} />
      </main>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={isAdmin ? "Ask about school data..." : "Ask about performance..."}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="input-buttons">
          {browserSupportsSpeechRecognition && (
            <button type="button" onClick={resetTranscript}>
              <FiMic />
            </button>
          )}
          <button type="submit" className="icon-btn send-btn">
            <FiSend />
          </button>
        </div>
      </form>
    </div>
);
}