import { Facebook, Instagram, MapPin, Twitter } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-secondary/30 border-t mt-auto w-full">
      <div className="container mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <MapPin className="h-6 w-6" />
              <span>SORSO-GO</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover the hidden gems of Sorsogon. From pristine beaches to rich cultural heritage, your adventure
              starts here.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/destinations" className="hover:text-primary">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary">
                  Culture & History
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-primary">
                  Travel Tips
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>info@sorsogo.ph</li>
              <li>+63 912 345 6789</li>
              <li>Sorsogon City, Philippines</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} SORSO-GO. All rights reserved.
          </div>
          <Link 
            href="/admin-login" 
            className="text-sm font-medium text-primary hover:underline"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  )
}
