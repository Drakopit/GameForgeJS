FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /repo
COPY servers/online-sandbox/GameForge.Online.Server.csproj servers/online-sandbox/
RUN dotnet restore servers/online-sandbox/GameForge.Online.Server.csproj
COPY servers/online-sandbox/ servers/online-sandbox/
COPY examples/online-sandbox-2d/config/world.rules.json examples/online-sandbox-2d/config/world.rules.json
RUN dotnet publish servers/online-sandbox/GameForge.Online.Server.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app ./
ENV ASPNETCORE_HTTP_PORTS=8080
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "GameForge.Online.Server.dll"]
