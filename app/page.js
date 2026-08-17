export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>jongan.com redirects</h1>
      <p>This service handles subdomain redirects:</p>
      <ul style={{ listStyle: 'none' }}>
        <li>blog.jongan.com → medium.com/@jonngan</li>
        <li>video.jongan.com → youtube.com/@jonngan</li>
      </ul>
    </div>
  );
}
