# DevSecOps – Sécurité continue

Ce projet doit intégrer des contrôles de sécurité automatisés : analyse statique, analyse de dépendances et scan des images Docker. Les sections ci‑dessous expliquent comment lancer les scans localement et comment ils sont intégrés dans le workflow CI.

## Pré-requis
- Docker et Docker Compose
- Maven 3.9+ / JDK 21 (services Spring Boot)
- Node.js (frontend Angular) – uniquement si vous voulez lancer `npm audit`

## 1. Analyse statique (SonarQube)
1) Démarrer un SonarQube local (ou utilisez SonarCloud) :
   ```bash
   docker run -d --name sonar -p 9000:9000 sonarqube:lts-community
   ```
2) Créer un token d’analyse dans Sonar.
3) Lancer l’analyse d’un service (exemple gateway-service) :
   ```bash
   mvn -f gateway-service/pom.xml -DskipTests sonar:sonar \
     -Dsonar.host.url=http://localhost:9000 \
     -Dsonar.login=$SONAR_TOKEN \
     -Dsonar.projectKey=gateway-service \
     -Dsonar.projectName=gateway-service
   ```
4) Répéter pour `discovery-service`, `order-service`, `product-service`.  
   (Frontend : vous pouvez compléter avec `npm run lint` et SonarScanner JS si besoin.)

## 2. Analyse des dépendances (OWASP Dependency-Check)
Exécuter le plugin Maven pour chaque microservice :
```bash
for svc in discovery-service gateway-service order-service product-service; do
  mvn -f $svc/pom.xml -B org.owasp:dependency-check-maven:check \
    -Dformat=HTML -DfailBuildOnCVSS=7
  echo "Rapport : $svc/target/dependency-check-report.html"
done
```
Les builds échoueront si une vulnérabilité CVSS ≥ 7 est trouvée (seuil ajustable via `-DfailBuildOnCVSS`).

## 3. Scan des images Docker (Trivy)
1) Construire les images (ou cibler une seule) :
   ```bash
   docker build -t discovery-service:scan discovery-service
   docker build -t gateway-service:scan gateway-service
   docker build -t order-service:scan order-service
   docker build -t product-service:scan product-service
   docker build -t frontend-angular:scan frontend-angular
   ```
2) Scanner avec Trivy :
   ```bash
   for img in discovery-service:scan gateway-service:scan order-service:scan product-service:scan frontend-angular:scan; do
     trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 "$img"
   done
   ```
`--exit-code 1` fait échouer si des vulnérabilités critiques/majeures sont détectées.

## 4. Intégration CI (GitHub Actions)
Un workflow `/.github/workflows/devsecops.yml` est ajouté :
- `dependency-check` : lance OWASP Dependency-Check sur chaque service Maven et publie les rapports.
- `trivy` : construit chaque image et la scanne (format SARIF, uploadé dans les artefacts).
- `sonar` (optionnel) : ne tourne que si `SONAR_TOKEN` est défini dans les secrets ; hôte et organisation sont configurables via `SONAR_HOST_URL` et `SONAR_ORGANIZATION`.

Secrets/variables à prévoir :
- `SONAR_TOKEN` (obligatoire pour Sonar)
- `SONAR_HOST_URL` (optionnel, défaut SonarCloud)
- `SONAR_ORGANIZATION` (optionnel, nécessaire pour SonarCloud)

## 5. Correction des vulnérabilités
- Mettre à jour les dépendances identifiées (bump versions, changer de bibliothèque vulnérable).
- Utiliser des images de base récentes et slim, et appliquer les mises à jour OS (`apk/yum/apt`) dans les Dockerfile.
- Corriger le code source pointé par Sonar (bugs, injections, secrets).
- Relancer les trois scans pour vérifier que les vulnérabilités sont levées avant de valider.
