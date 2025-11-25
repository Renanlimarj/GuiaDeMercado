function Home() {
  return (
    <div style={{
      textAlign: "center",
      padding: "40px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>Marina, eu te amo ❤️</h1>

      <img 
        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200" 
        alt="Imagem bonita" 
        style={{
          marginTop: "20px",
          maxWidth: "90%",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}
      />
    </div>
  );
}

export default Home;