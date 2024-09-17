"use client"
import React, { useState } from 'react';
import { TextField, Switch, FormControlLabel, Button, Box, Grid, Pagination, Modal, Typography } from '@mui/material';

const InputForm = () => {
  const [manualMode, setManualMode] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [bio, setBio] = useState("");
  const [vocabulary, setVocabulary] = useState("");
  const [theme, setTheme] = useState("");
  const [autoTheme, setAutoTheme] = useState("");
  const [tone, setTone] = useState("формальный");
  const [length, setLength] = useState(0);
  const [articles, setArticles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;
  const [openModal, setOpenModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState("");

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

  const buildRequestManual = (name: string, biography: string, phrases: string, theme: string, tone: string, length: number) => {
    const prompt = `===Instruction
    Твоя задача на основании контекста ты должен написать статью...

    ===Context
    Имя автора: ${name}
    Описание/биография: ${biography}
    Словарный запас: ${phrases}
    Тематика (специализация): ${theme}
    Тональность текста: ${tone}
    Длина статьи: ${length} слов
    
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
    let selectedTheme = autoTheme;

    if (!manualMode) {
      selectedTheme = trendingThemes[Math.floor(Math.random() * trendingThemes.length)];
      alert(`Выбранная тема: ${selectedTheme}`);
    }

    const requestBody = manualMode 
      ? buildRequestManual(authorName, bio, vocabulary, theme, tone, length) 
      : buildRequestAuto(authorName, selectedTheme);
    
    const response = await fetch('https://api.proxyapi.ru/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-8hMBBWM4X1IjBUIKT4pfXAtqYInRTF44'
      },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    const articleText = data.choices[0].message.content;
    const parsedData = JSON.parse(articleText);
    const article = parsedData.article;
    setArticles((prevArticles) => [...prevArticles, article]);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

  const handleOpenModal = (article: string) => {
    setSelectedArticle(article);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedArticle("");
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
      <FormControlLabel
        control={<Switch checked={manualMode} onChange={handleSwitchChange} />}
        label="Ручной режим"
        sx={{ color: 'black' }}
      />
      <TextField 
        label="Имя" 
        variant="outlined" 
        sx={{ width: '250px' }}
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        InputProps={{
          sx: { 
            borderRadius: '8px', 
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'silver',
              },
              '&:hover fieldset': {
                borderColor: 'silver',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'silver',
              },
            },
          },
        }} 
      />
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
                  borderColor: 'silver',
                },
                '&:hover fieldset': {
                  borderColor: 'silver',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'silver',
                },
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
                  borderColor: 'silver',
                },
                '&:hover fieldset': {
                  borderColor: 'silver',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'silver',
                },
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
              borderRadius: '8px', 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'silver',
                },
                '&:hover fieldset': {
                  borderColor: 'silver',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'silver',
                },
              },
            }} 
          />
          <TextField 
            label="Тональность текста (формально)" 
            variant="outlined" 
            fullWidth 
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            sx={{ 
              width: '250px', 
              borderRadius: '8px', 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'silver',
                },
                '&:hover fieldset': {
                  borderColor: 'silver',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'silver',
                },
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
                  borderColor: 'silver',
                },
                '&:hover fieldset': {
                  borderColor: 'silver',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'silver',
                },
              },
            }} 
          />
        </>
      )}
      {!manualMode && (
        <TextField 
          label="Тематика (авторежим)" 
          variant="outlined" 
          fullWidth 
          value={autoTheme}
          onChange={(e) => setAutoTheme(e.target.value)}
          disabled
          sx={{ 
            width: '250px', 
            borderRadius: '8px', 
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'silver',
              },
              '&:hover fieldset': {
                borderColor: 'silver',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'silver',
              },
            },
          }} 
        />
      )}
      <Button variant="contained" color="primary" onClick={handleSubmit}>Отправить</Button>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {currentArticles.map((article, index) => (
          <Grid item xs={2.4} key={index}>
            <Box 
              sx={{ 
                border: '1px solid silver', 
                padding: 1, 
                borderRadius: '16px', 
                cursor: 'pointer', 
                width: '200px', 
                height: '200px', 
                overflow: 'hidden', 
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
                transition: 'transform 0.2s', 
                '&:hover': {
                  transform: 'scale(1.05)', 
                },
              }} 
              onClick={() => handleOpenModal(article)}
            >
              <Typography variant="body2" sx={{ height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}>
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
          <Typography variant="h6" component="h2">
            Полная статья
          </Typography>
          <Typography sx={{ mt: 2 }}>
            {selectedArticle}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default InputForm;
