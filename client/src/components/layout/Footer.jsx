export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="container mx-auto px-4 text-center space-y-2">
        <p className="text-gray-300 text-sm mt-2">
          Need help? Contact support:
          {" "}
          <a href="mailto:admin@example.com" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
            admin@example.com
          </a>
          {" "}|{" "}
          <a href="tel:2210301445" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
            2210301445
          </a>
        </p>
        <p>&copy; {new Date().getFullYear()} ShopHub. All rights reserved.</p>
      </div>
    </footer>
  );
}
