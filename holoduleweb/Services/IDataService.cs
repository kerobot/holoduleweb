namespace holoduleweb.Services
{
    public interface IDataService
    {
        string UserName { get; }
        string Password { get; }
        string BaseUrl { get; }
    }
}
