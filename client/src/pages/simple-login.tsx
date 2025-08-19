export default function SimpleLogin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl mb-4 shadow-lg">
              <span className="text-2xl">👶</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              MamãeCare
            </h1>
            <p className="text-gray-600 text-sm mt-2">Gestão da Maternidade</p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                📧 Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-300"
                placeholder="seu@email.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                🔒 Senha
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Entrar
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm mb-4">ou continue com</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Google */}
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                <span className="text-lg">🟠</span>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              
              {/* Apple */}
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                <span className="text-lg">🍎</span>
                <span className="text-sm font-medium text-gray-700">Apple</span>
              </button>
            </div>
          </div>

          {/* PWA Install Button */}
          <div className="mt-6 text-center">
            <button id="installBtn" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hidden">
              📱 Instalar App MamãeCare
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Não tem conta?{' '}
              <a href="#" className="text-pink-500 font-medium hover:text-pink-600 transition-colors">
                Cadastrar-se
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            ©2025 MamãeCare | <a href="#" className="hover:text-gray-700">Termos</a> | <a href="#" className="hover:text-gray-700">Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  );
}