import { hash } from "bcryptjs";
import { prisma } from "../src/libs/database/prisma.js";

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpar dados existentes
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.like.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Dados antigos removidos");

  // Criar senha hash para todos os usuários
  const hashedPassword = await hash("password123", 8);

  // Criar usuários
  const users = await Promise.all([
    prisma.user.create({
      data: {
        firstname: "João",
        lastname: "Silva",
        email: "joao@example.com",
        password: hashedPassword,
        gender: "MALE",
        preference: "FEMALE",
        dob: new Date("1995-05-15")
      }
    }),
    prisma.user.create({
      data: {
        firstname: "Maria",
        lastname: "Santos",
        email: "maria@example.com",
        password: hashedPassword,
        gender: "FEMALE",
        preference: "MALE",
        dob: new Date("1998-08-22")
      }
    }),
    prisma.user.create({
      data: {
        firstname: "Pedro",
        lastname: "Costa",
        email: "pedro@example.com",
        password: hashedPassword,
        gender: "MALE",
        preference: "FEMALE",
        dob: new Date("1992-03-10")
      }
    }),
    prisma.user.create({
      data: {
        firstname: "Ana",
        lastname: "Oliveira",
        email: "ana@example.com",
        password: hashedPassword,
        gender: "FEMALE",
        preference: "MALE",
        dob: new Date("1996-11-30")
      }
    }),
    prisma.user.create({
      data: {
        firstname: "Carlos",
        lastname: "Ferreira",
        email: "carlos@example.com",
        password: hashedPassword,
        gender: "MALE",
        preference: "OTHER",
        dob: new Date("1994-07-18")
      }
    }),
    prisma.user.create({
      data: {
        firstname: "Juliana",
        lastname: "Almeida",
        email: "juliana@example.com",
        password: hashedPassword,
        gender: "FEMALE",
        preference: "MALE",
        dob: new Date("1999-02-14")
      }
    }),
    prisma.user.create({
      data: {
        firstname: "Alex",
        lastname: "Martinez",
        email: "alex@example.com",
        password: hashedPassword,
        gender: "OTHER",
        preference: "OTHER",
        dob: new Date("1997-09-25")
      }
    })
  ]);

  console.log(`✅ ${users.length} usuários criados`);

  // Criar fotos para alguns usuários
  await prisma.photo.createMany({
    data: [
      {
        url: "https://i.pravatar.cc/300?img=12",
        userId: users[0].id,
        profilePhoto: true
      },
      {
        url: "https://i.pravatar.cc/300?img=5",
        userId: users[1].id,
        profilePhoto: true
      },
      {
        url: "https://i.pravatar.cc/300?img=33",
        userId: users[2].id,
        profilePhoto: true
      },
      {
        url: "https://i.pravatar.cc/300?img=9",
        userId: users[3].id,
        profilePhoto: true
      },
      {
        url: "https://i.pravatar.cc/300?img=15",
        userId: users[6].id, // Alex
        profilePhoto: true
      }
    ]
  });

  console.log("📷 Fotos criadas");

  // Criar likes e dislikes
  // João (0) curte Maria (1) e Ana (3), descurte Juliana (5)
  // Maria (1) curte João (0) <- MATCH!
  // Pedro (2) curte Ana (3), descurte Maria (1)
  // Ana (3) curte Pedro (2) <- MATCH!
  // Alex (6) com gênero OTHER pode curtir qualquer um
  await prisma.like.createMany({
    data: [
      { fromUserId: users[0].id, toUserId: users[1].id, isLike: true },
      { fromUserId: users[0].id, toUserId: users[3].id, isLike: true },
      { fromUserId: users[0].id, toUserId: users[5].id, isLike: false }, // João descurtiu Juliana
      { fromUserId: users[1].id, toUserId: users[0].id, isLike: true },
      { fromUserId: users[2].id, toUserId: users[3].id, isLike: true },
      { fromUserId: users[2].id, toUserId: users[1].id, isLike: false }, // Pedro descurtiu Maria
      { fromUserId: users[3].id, toUserId: users[2].id, isLike: true },
      { fromUserId: users[4].id, toUserId: users[1].id, isLike: true },
      { fromUserId: users[5].id, toUserId: users[2].id, isLike: true },
      { fromUserId: users[6].id, toUserId: users[0].id, isLike: true }, // Alex curte João
      { fromUserId: users[6].id, toUserId: users[1].id, isLike: true }  // Alex curte Maria
    ]
  });

  console.log("❤️  Likes e dislikes criados");

  // Criar matches (likes mútuos)
  const matches = await Promise.all([
    // Match entre João e Maria
    prisma.match.create({
      data: {
        user1Id: users[0].id,
        user2Id: users[1].id
      }
    }),
    // Match entre Pedro e Ana
    prisma.match.create({
      data: {
        user1Id: users[2].id,
        user2Id: users[3].id
      }
    })
  ]);

  console.log(`💕 ${matches.length} matches criados`);

  // Criar mensagens
  await prisma.message.createMany({
    data: [
      {
        senderId: users[0].id,
        matchId: matches[0].id,
        content: "Oi Maria! Tudo bem?"
      },
      {
        senderId: users[1].id,
        matchId: matches[0].id,
        content: "Oi João! Tudo ótimo, e você?"
      },
      {
        senderId: users[0].id,
        matchId: matches[0].id,
        content: "Também! Quer sair para tomar um café?"
      },
      {
        senderId: users[2].id,
        matchId: matches[1].id,
        content: "Olá Ana! Prazer em conhecer você 😊"
      },
      {
        senderId: users[3].id,
        matchId: matches[1].id,
        content: "Oi Pedro! O prazer é meu!"
      }
    ]
  });

  console.log("💬 Mensagens criadas");

  console.log("\n✨ Seed concluído com sucesso!");
  console.log("\n📊 Resumo:");
  console.log(`   - ${users.length} usuários (incluindo 1 com gênero OTHER)`);
  console.log(`   - 5 fotos`);
  console.log(`   - 9 likes + 2 dislikes`);
  console.log(`   - ${matches.length} matches`);
  console.log(`   - 5 mensagens`);
  console.log("\n🔑 Todos os usuários têm a senha: password123");
  console.log("\n🏳️‍⚧️ Alex (alex@example.com) tem gênero OTHER e pode ver todos os usuários");
}

main()
  .catch(e => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
