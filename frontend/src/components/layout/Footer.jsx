export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              © {currentYear} HealthHub. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-teal-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-teal-600">
              Terms of Service
            </a>
            <a href="#" className="hover:text-teal-600">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
