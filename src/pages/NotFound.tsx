import { Link } from 'react-router-dom'
import { Footer, Nav } from '../components/Layout'

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="page narrow">
        <h1>Page not found</h1>
        <p>
          <Link to="/work">Back to the work page</Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
