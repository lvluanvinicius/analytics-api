
# Adicionar usuário no banco de dados.
db.getSiblingDB("admin").auth("admin", "admin");
usr = db.getSiblingDB("potencia");
usr.getCollection("Users").insert({username: "analytics",password: "" ,name: "Analytics System",email: "ti@example.com.br"});
