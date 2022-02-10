namespace holoduleweb.Services
{
    public class DataService : IDataService
    {
        private readonly string _userName;
        private readonly string _password;
        private readonly string _baseUrl;

        public DataService(string userName, string password, string baseUrl)
        {
            _userName = userName;
            _password = password;
            _baseUrl = baseUrl;
        }

        public string UserName => _userName;
        public string Password => _password;
        public string BaseUrl => _baseUrl;
    }
}
