"use client"
import React, { useState } from 'react';
import './styles.scss';
import { TextField, Switch, FormControlLabel, Button, Box, Grid, Pagination, Modal, Typography, MenuItem, CircularProgress } from '@mui/material';
const languages = [
  "Русский",
  "Английский",
  "Немецкий",
  "Китайский"
];
const InputForm = () => {
  const [manualMode, setManualMode] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [bio, setBio] = useState("");
  const [vocabulary, setVocabulary] = useState("");
  const [theme, setTheme] = useState("");
  const [lang, setLang] = useState("");
  const [autoTheme, setAutoTheme] = useState("");
  const [tone, setTone] = useState("формальный");
  const [length, setLength] = useState(500);
  const [articles, setArticles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;
  const [openModal, setOpenModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState("");
  const [analytics, setAnalytics] = useState<{ keywords: Record<string, number>; totalLength: { characters: number; words: number } } | null>(null);
  const [loading, setLoading] = useState(false);

  const trendingThemes = [
    "Технологии и инновации",
    "Экология и устойчивое развитие",
    "Здоровье и фитнес",
    "Культура и искусство",
    "Финансовая грамотность",
    "Путешествия и туризм",
    "Образование и саморазвитие",
    "Социальные сети и влияние",
    "Кибербезопасность",
    "Искусственный интеллект",
    "Мода и стиль",
    "Психология и личностный рост",
    "Спорт и активный образ жизни",
    "Кулинария и гастрономия",
    "Научные открытия и исследования"
  ];

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManualMode(event.target.checked);
  };

  const buildRequestManual = (name: string, biography: string, phrases: string, theme: string, tone: string, length: number, lang: string) => {
    const prompt = `===Instruction
    Твоя задача на основании контекста ты должен написать статью...

    ===Context
    Имя автора: ${name}
    Описание/биография: ${biography}
    Словарный запас: ${phrases}
    Тематика (специализация): ${theme}
    Тональность текста: ${tone}
    Длина статьи: ${length} слов
    Язык статьи: ${lang}
    
    ===Output
    Response must be JSON only without additional text
    {
      "article": "Статья"
    }

    ===Response`;
    console.log(prompt);
    return {
      model: "gpt-4o-mini",
      messages: [
        {"role": "system", "content": "You are ChatGPT, a helpful assistant."},
        {"role": "user", "content": prompt}
      ],
      max_tokens: 5000,
      temperature: 0.7
    };
  };

  const buildRequestAuto = (name: string, theme: string) => {
    const prompt = `===Instruction
    Твоя задача на основании имени автора и темы написать статью от его имени...

    ===Context
    Имя автора: ${name}
    Тематика (специализация): ${theme}
    
    ===Output
    Response must be JSON only without additional text
    {
      "article": "Статья"
    }

    ===Response`;
    console.log(prompt);
    return {
      model: "gpt-4o-mini",
      messages: [
        {"role": "system", "content": "You are ChatGPT, a helpful assistant."},
        {"role": "user", content: prompt}
      ],
      max_tokens: 5000,
      temperature: 0.7
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let selectedTheme = autoTheme;

    if (!manualMode) {
      selectedTheme = trendingThemes[Math.floor(Math.random() * trendingThemes.length)];
      alert(`Выбранная тема: ${selectedTheme}`);
    }

    const requestBody = manualMode 
      ? buildRequestManual(authorName, bio, vocabulary, theme, tone, length, lang) 
      : buildRequestAuto(authorName, selectedTheme);
    
    const response = await fetch('https://api.proxyapi.ru/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-8hMBBWM4X1IjBUIKT4pfXAtqYInRTF44'
      },
      body: JSON.stringify(requestBody),
    });
    const response2 = await fetch('/api/search', {
      method: 'GET',
      headers: {"Access-Control-Allow-Origin": "*"},
    });
    const data2 = await response2.text();
    console.log(response2);
    console.log(data2);
    const data = await response.json();
    console.log(data); // Добавлено для проверки данных
    const articleText = data.choices[0].message.content;
    const parsedData = JSON.parse(articleText);
    const article = parsedData.article;
    console.log(article); // Добавлено для проверки добавляемой статьи
    setArticles((prevArticles) => [...prevArticles, article]);

    // Новый запрос для анализа текста
    const analysisRequest = {
        model: "gpt-4o-mini",
        messages: [
            {"role": "system", "content": "You are ChatGPT, a helpful assistant."},
            {"role": "user", "content": `<context>Пожалуйста, проанализируйте стиль письма, тон и структуру в следующих примерах. Сосредоточьтесь на таких элементах, как выбор словаря, сложность предложений, темп и общий голос.</context><examples>${article}</examples><instruction>Создайте мини-аналитику статьи.</instruction>`}
        ],
        max_tokens: 500,
        temperature: 0.7
    };

    const analysisResponse = await fetch('https://api.proxyapi.ru/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-8hMBBWM4X1IjBUIKT4pfXAtqYInRTF44'
        },
        body: JSON.stringify(analysisRequest),
    });

    const analysisData = await analysisResponse.json();
    const analyticsResult = analysisData.choices[0].message.content;
    alert(analyticsResult);
    setLoading(false);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  console.log(currentArticles); // Добавлено для проверки текущих статей

  const handleOpenModal = (article: string) => {
    setSelectedArticle(article);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedArticle("");
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%',backgroundColor:"#fff" ,zIndex: 5 }}>
      <Button
        variant="contained"
        onClick={() => setManualMode(!manualMode)}
        sx={{ color: 'white', zIndex: 5, marginBottom: 10}}
      >
        Переключить режим
      </Button>
      <div className="input-group">
        <label className="input-group__label" htmlFor="authorName">{manualMode ? "Ручной" : "Авто"}</label>
        <input 
          id="authorName"
          className="input-group__input"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          style={{ color: 'white', width: '100%'}}
        />
      </div>
      {manualMode && (
        <>
          <TextField 
            label="Описание/Биография" 
            variant="outlined" 
            fullWidth 
            multiline 
            rows={4} 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            sx={{ 
              width: '250px', 
              borderRadius: '8px', 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                '& input': {
                  color: 'white',
                },
                '& textarea': {
                  color: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
            }} 
          />
          <TextField 
            label="Словарный запас" 
            variant="outlined" 
            fullWidth 
            value={vocabulary}
            onChange={(e) => setVocabulary(e.target.value)}
            sx={{ 
              width: '250px', 
              borderRadius: '8px', 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                '& input': {
                  color: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
            }} 
          />
          <TextField 
            label="Тематика" 
            variant="outlined" 
            fullWidth 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            sx={{ 
              width: '250px', 
              color: 'white',
              borderRadius: '8px', 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                '& input': {
                  color: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
            }} 
          />
          <TextField 
            label="Язык статьи" 
            variant="outlined" 
            className={`input_text`}
            fullWidth 
            select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            sx={{ 
              color: 'white',
              width: '250px', 
              borderRadius: '8px', 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                '& input': {
                  color: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
              '& .MuiOutlinedInput-input': {
                color: 'white',
              },
            }} 
          >
            {languages.map((language) => (
              <MenuItem key={language} value={language}>
                {language}
              </MenuItem>
            ))}
          </TextField>
          <TextField 
            label="Тональность текста (формально)" 
            variant="outlined" 
            fullWidth 
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            sx={{ 
              color:'white',
              width: '250px', 
              borderRadius: '8px', 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                '& input': {
                  color: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
            }} 
          />
          <TextField 
            label="Длина статьи (токены)" 
            variant="outlined" 
            fullWidth 
            type="number" 
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            sx={{ 
              width: '250px', 
              borderRadius: '8px', 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                '& input': {
                  color: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
            }} 
          />
        </>
      )}
      
      <Button variant="contained" sx={{ marginTop: 2, zIndex: 4, backgroundColor: '#', color: 'white' }} onClick={handleSubmit}>Отправить</Button>
      {loading && <CircularProgress sx={{ marginTop: 2 }} />}
      <Grid container spacing={2} sx={{ marginTop: 2, zIndex: 4, color:'white' }}>
        {currentArticles.map((article, index) => (
          <Grid item xs={2.4} key={index}>
            <Box 
              sx={{ 
                border: '1px solid silver', 
                padding: 1, 
                zIndex: 3,
                color:'white',  
                borderRadius: '16px', 
                cursor: 'pointer', 
                width: '200px', 
                height: '200px', 
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
                transition: 'transform 0.2s', 
                '&:hover': {
                  transform: 'scale(1.05)', 
                },
              }} 
              onClick={() => handleOpenModal(article)}
            >
              <Typography variant="body2" sx={{ height: '100%', display: 'flex', alignItems: 'flex-start', zIndex: 4, justifyContent: 'flex-start', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', color: 'white' }}>
                {article}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      {articles.length > articlesPerPage && (
        <Pagination 
          count={Math.ceil(articles.length / articlesPerPage)} 
          page={currentPage} 
          onChange={handleChangePage} 
          color="primary" 
          sx={{ marginTop: 2 }}
        />
      )}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ 
          bgcolor: 'background.paper', 
          border: '2px solid silver', 
          boxShadow: 24, 
          p: 4, 
          borderRadius: 2,
          maxWidth: 600,
          margin: 'auto',
          marginTop: '15vh', 
          overflowY: 'scroll', 
          maxHeight: '80vh' 
        }}>
          <Typography variant="h6" component="h2" className="MuiTypography-root" sx={{ color: 'black' }}>
            Полная статья
          </Typography>
          <Typography className="MuiTypography-root" sx={{ mt: 2, color: 'black' }}>
            {selectedArticle}
          </Typography>
        </Box>
      </Modal>
      {analytics && (
            <Box sx={{ marginTop: 2, padding: 2, border: '1px solid silver', borderRadius: '8px', backgroundColor: '#000000' }}>
                <Typography variant="h6" className="MuiTypography-root" sx={{ color: 'white', backgroundColor: 'black' }}>Мини-аналитика статьи</Typography>
                <Typography variant="body1" className="MuiTypography-root" sx={{ color: 'white', backgroundColor: 'black' }}>Ключевые слова:</Typography>
                {Object.entries(analytics.keywords).map(([keyword, count]) => (
                    <Typography key={keyword} variant="body2" className="MuiTypography-root" sx={{ color: 'white', backgroundColor: 'black' }}>- {keyword} ({count} раз)</Typography>
                ))}
                <Typography variant="body1" className="MuiTypography-root" sx={{ color: 'white', backgroundColor: 'black' }}>Общая длина текста:</Typography>
                <Typography variant="body2" className="MuiTypography-root" sx={{ color: 'white', backgroundColor: 'black' }}>- Символы: {analytics.totalLength.characters}</Typography>
                <Typography variant="body2" className="MuiTypography-root" sx={{ color: 'white', backgroundColor: 'black' }}>- Слова: {analytics.totalLength.words}</Typography>
            </Box>
        )}
    </Box>
  );
};

export default InputForm;
