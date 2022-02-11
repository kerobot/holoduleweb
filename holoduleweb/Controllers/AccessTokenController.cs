using holoduleweb.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RestSharp;
using System;

namespace holoduleweb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccessTokenController : ControllerBase
    {
        private readonly IDataService _dataService;
        private readonly ILogger<AccessTokenController> _logger;

        public AccessTokenController(ILogger<AccessTokenController> logger, IDataService dataService)
        {
            _logger = logger;
            _dataService = dataService;
        }

        [HttpGet] // GET /api/accesstoken
        public string Get()
        {
            var auth = new Auth(_dataService.UserName, _dataService.Password);
            var json = JsonConvert.SerializeObject(auth);

            var client = new RestClient
            {
                BaseUrl = new Uri(_dataService.BaseUrl)
            };

            var request = new RestRequest("holoapi/auth", Method.POST);
            request.Parameters.Clear();
            request.AddHeader("Content-Type", "application/json");
            request.AddParameter("application/json", json, ParameterType.RequestBody);

            var response = client.Execute(request);
            if (response.IsSuccessful)
            {
                return response.Content;
            }
            return "error";
        }

        [JsonObject]
        public class Auth
        {
            [JsonProperty("username")]
            public string Username { get; private set; }

            [JsonProperty("password")]
            public string Password { get; private set; }

            public Auth(string username, string password)
            {
                this.Username = username;
                this.Password = password;
            }
        }
    }
}
