import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, TextField, FormControl, InputLabel, 
    MenuItem, Select, Button, CircularProgress, Paper, Card, 
    CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, Divider, List, ListItem, ListItemText
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

import EmailIcon from '@mui/icons-material/Email';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';

// Custom Theme
/*const theme = createTheme({
    palette: {
        primary: {
            main: '#532190', // Deep blue-gray
            light: '#3F248F',
            dark: '#9E34B1'
        },
        secondary: {
            main: '#52379F', // Bright blue
            light: '#823BA0',
            dark: '#842B94'
        },
        background: {
            default: '#3498DB', // Light gray-blue
            paper: '#FFFFFF'
        },
        text: {
            primary: '#283590',
            secondary: '#000'
        }
    },
    typography: {
        fontFamily: 'Verdana',
        h4: {
            fontWeight: 700,
            letterSpacing: '-0.5px'
        },
        body1: {
            lineHeight: 1.6
        }
    },
    palette: {
            mode: darkMode ? "dark" : "light",

            primary: {
                main: "#532190"
            },

            secondary: {
                main: "#52379F"
            }
        }
    }
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontWeight: 600
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-5px)'
                    }
                }
            }
        }
    }
});*/

function App() {
    const [activeTab, setActiveTab] = useState('generator');
    const [emailContent, setEmailContent] = useState('');
    const [instructions, setInstructions] = useState('');
    const [tone, setTone] = useState('');
    const [generatedReply, setGeneratedReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [history, setHistory] = useState(() => {
        const savedHistory = localStorage.getItem("emailHistory");
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    const [stats, setStats] = useState({
        totalRepliesGenerated: 0,
        mostUsedTone: 'N/A',
        averageReplyLength: 0,
        totalWordsGenerated: 0
    });
    const [emailType, setEmailType] = useState("");

    /* const [promptHistory, setPromptHistory] = useState([
        { prompt: "Client project update", tone: "Professional", timestamp: new Date().toLocaleString() },
        { prompt: "Team collaboration", tone: "Friendly", timestamp: new Date().toLocaleString() },
        { prompt: "Sales pitch follow-up", tone: "Casual", timestamp: new Date().toLocaleString() }
    ]);*/
    const [promptHistory, setPromptHistory] = useState(() => {
        const saved = localStorage.getItem("promptHistory");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(
            "promptHistory",
            JSON.stringify(promptHistory)
        );
    }, [promptHistory]);

    useEffect(() => {
        localStorage.setItem(
            "emailHistory",
            JSON.stringify(history)
        );
    }, [history]);

    // Custom Theme
    const theme = createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",

            primary: {
                main: "#532190",
                light: "#3F248F",
                dark: "#9E34B1"
            },

            secondary: {
                main: "#52379F",
                light: "#823BA0",
                dark: "#842B94"
            },

            background: {
                default: darkMode ? "#121212" : "#3498DB",
                paper: darkMode ? "#1E1E1E" : "#FFFFFF"
            },

            text: {
                primary: darkMode ? "#FFFFFF" : "#283590",
                secondary: darkMode ? "#CCCCCC" : "#000000"
            }
        },

        typography: {
            fontFamily: "Verdana",
            h4: {
                fontWeight: 700,
                letterSpacing: "-0.5px"
            },
            body1: {
                lineHeight: 1.6
            }
        },

        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: "none",
                        borderRadius: 8,
                        padding: "12px 24px",
                        fontWeight: 600
                    }
                }
            },

            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        transition: "transform 0.3s ease",

                        "&:hover": {
                            transform: "translateY(-5px)"
                        }
                    }
                }
            }
        }
    });


    const classifyEmail = (text) => {
        const lower = text.toLowerCase();
        if(lower.includes("interview"))
            return "Interview";

        if(lower.includes("meeting"))
            return "Meeting";

        if(lower.includes("job"))
            return "Job Application";

        if(lower.includes("project"))
            return "Project";
        return "General";
    };

    async function handleSubmit() {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:9191/api/email/generate", {
                emailContent,
                instructions,
                tone
            });
            
            const newReply = response.data;
            setGeneratedReply(newReply);

            // Email Classification
            const detectedType = classifyEmail(emailContent);
            setEmailType(detectedType);

            setPromptHistory(prev => [
                {
                    prompt: emailContent.substring(0, 50),
                    tone: tone || "Unspecified",
                    timestamp: new Date().toLocaleString()
                },
                ...prev
            ].slice(0,10));
            
            const newHistoryEntry = {
                originalEmail: emailContent,
                generatedReply: newReply,
                tone: tone || 'Unspecified',
                timestamp: new Date().toLocaleString()
            };
            
            setHistory(prevHistory => [newHistoryEntry, ...prevHistory].slice(0, 10));
            
            setStats(prev => ({
                totalRepliesGenerated: prev.totalRepliesGenerated + 1,
                mostUsedTone: tone || prev.mostUsedTone,
                averageReplyLength: Math.round(
                    (prev.averageReplyLength * prev.totalRepliesGenerated + newReply.length)
                    / (prev.totalRepliesGenerated + 1)
                ),
                totalWordsGenerated:
                    prev.totalWordsGenerated +
                    newReply.split(/\s+/).length
            }));

            toast.success("Reply Generated Successfully");
        } catch (err) {
              toast.error(
                  err.response?.data ||
                  err.message ||
                  "Generation Failed"
              );
          } finally {
            setLoading(false);
        }
    }

    const handleDownload = () => {
        const blob = new Blob([generatedReply], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, "email_reply.txt");
        toast.success("Downloaded");
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedReply);
        toast.success("Copied to Clipboard");
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        const lines = doc.splitTextToSize(
            generatedReply,
            180
        );

        doc.text(lines, 10, 10);
        doc.save("email_reply.pdf");

        toast.success("PDF Downloaded");
    };

    const handleClear = () => {
        setEmailContent('');
        setInstructions('');
        setTone('');
        setGeneratedReply('');
    };

    const renderGenerator = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Email Details
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            helperText={`${emailContent.length} characters`}
                            variant="outlined"
                            label="Original Email"
                            value={emailContent}
                            onChange={(e) => setEmailContent(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            helperText={`${instructions.length} characters`}
                            variant="outlined"
                            label="Instructions"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}

                            sx={{
                                mb: 2,
                                '& .MuiInputLabel-root': {
                                    color: '#E91E63',
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#FF5722'
                                },
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#FFF3E0',
                                    '& fieldset': {
                                        borderColor: '#FF5722',
                                        borderWidth: '2px'
                                    }
                                }
                            }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Tone</InputLabel>
                            <Select
                                value={tone}
                                label="Tone"
                                onChange={(e) => setTone(e.target.value)}
                            >
                                <MenuItem value="Professional">Professional</MenuItem>
                                <MenuItem value="Formal">Formal</MenuItem>
                                <MenuItem value="Friendly">Friendly</MenuItem>
                                <MenuItem value="Casual">Casual</MenuItem>
                                <MenuItem value="Confident">Confident</MenuItem>
                                <MenuItem value="Persuasive">Persuasive</MenuItem>
                                <MenuItem value="Apologetic">Apologetic</MenuItem>
                                <MenuItem value="Grateful">Grateful</MenuItem>
                                <MenuItem value="Enthusiastic">Enthusiastic</MenuItem>
                                <MenuItem value="Playful">Playful</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={!emailContent || loading}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} />
                                        &nbsp;Generating...
                                    </>
                                ) : (
                                    "Generate Reply"
                                )}
                            </Button>

                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleClear}
                            >
                                Clear
                            </Button>
                        </Box>

                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                {generatedReply && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Generated Reply
                            </Typography>
                            <Typography
                                    variant="subtitle1"
                                    sx={{
                                        mb: 2,
                                        fontWeight: "bold",
                                        color: "green"
                                    }}
                                >
                                    Email Type: {emailType}
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={10}
                                variant="outlined"
                                value={generatedReply}
                                InputProps={{ readOnly: true }}
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleDownload}
                                >
                                    TXT
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleDownloadPDF}
                                >
                                    PDF
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Grid>
        </Grid>
    );

    const chartData = [
        {
            name: "Replies",
            value: stats.totalRepliesGenerated
        },
        {
            name: "Words",
            value: stats.totalWordsGenerated
        },
        {
            name: "Avg Length",
            value: stats.averageReplyLength
        }
    ];

    const COLORS = [
        "#532190", // purple
        "#3498DB", // blue
        "#2ECC71"  // green
    ];

    const renderDashboard = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent
                        sx={{
                            textAlign: "center"
                        }}
                    >
                        <EmailIcon fontSize="large" color="primary" />

                        <Typography variant="h6">
                            Replies Generated
                        </Typography>

                        <Typography variant="h4">
                            {stats.totalRepliesGenerated}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Updated Live
                        </Typography>

                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent
                        sx={{
                            textAlign: "center"
                        }}
                    >
                        <CategoryIcon fontSize="large" color="secondary" />

                        <Typography variant="h6">
                            Most Used Tone
                        </Typography>

                        <Typography variant="h4">
                            {stats.mostUsedTone}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Updated Live
                        </Typography>

                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent
                        sx={{
                            textAlign: "center"
                        }}
                    >
                        <TrendingUpIcon fontSize="large" color="success" />

                        <Typography variant="h6">
                            Avg. Reply Length
                        </Typography>

                        <Typography variant="h4">
                            {stats.averageReplyLength} chars
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Updated Live
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent
                        sx={{
                            textAlign: "center"
                        }}
                    >
                        <TextFieldsIcon fontSize="large" color="warning" />

                        <Typography variant="h6">
                            Words Generated
                        </Typography>

                        <Typography variant="h4">
                            {stats.totalWordsGenerated}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Updated Live
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Usage Analytics
                        </Typography>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value">
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderHistory = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Recent Replies</Typography>
                        {history.length === 0 ? (
                            <Typography>No recent replies</Typography>
                        ) : (
                            history.map((entry, index) => (
                                <Card key={index} sx={{ mb: 2, p: 2 }}>
                                    <Typography variant="subtitle2">Tone: {entry.tone}</Typography>
                                    <Typography variant="body2">{entry.generatedReply}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {entry.timestamp}
                                    </Typography>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Prompt History</Typography>
                        <List>
                            {promptHistory.map((prompt, index) => (
                                <ListItem key={index} divider>
                                    <ListItemText 
                                        primary={prompt.prompt} 
                                        secondary={`${prompt.tone} • ${prompt.timestamp}`} 
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="lg" sx={{ py: 4, backgroundColor: darkMode ? "#121212" : "#3498DB" }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        backgroundColor: darkMode ? "#1E1E1E" : "#FFFFFF"
                    }}
                >
                    <Typography 
                        variant="h4" 
                        align="center" 
                        gutterBottom 
                        sx={{ 
                            color: theme.palette.primary.main, 
                            mb: 4 
                        }}
                    >
                        Email Reply Generator
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mb: 2
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Button 
                            variant={activeTab === 'generator' ? 'contained' : 'outlined'} 
                            color="primary" 
                            onClick={() => setActiveTab('generator')}
                            sx={{ mr: 2 }}
                        >
                            Generator
                        </Button>
                        <Button 
                            variant={activeTab === 'dashboard' ? 'contained' : 'outlined'} 
                            color="primary" 
                            onClick={() => setActiveTab('dashboard')}
                            sx={{ mr: 2 }}
                        >
                            Dashboard
                        </Button>
                        <Button 
                            variant={activeTab === 'history' ? 'contained' : 'outlined'} 
                            color="primary" 
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </Button>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {activeTab === 'generator' && renderGenerator()}
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'history' && renderHistory()}
                </Paper>

                <Box
                    sx={{
                        textAlign: "center",
                        mt: 4,
                        color: "gray",
                        fontSize: "#666"
                    }}
                >
                    Powered by Spring Boot • React • Groq AI
                </Box>

                <ToastContainer 
                    position="bottom-right" 
                    autoClose={3000} 
                    hideProgressBar 
                    theme="colored" 
                />
            </Container>
        </ThemeProvider>
    );
}

export default App;