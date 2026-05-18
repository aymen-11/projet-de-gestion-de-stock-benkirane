<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Categorie;
use App\Models\Commande;
use App\Models\Fournisseur;
use App\Models\LigneCommande;
use App\Models\Mouvement;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users with Roles ───────────────────────────────────────────────
        $admin = User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@stock.ma',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        $responsable = User::create([
            'name'     => 'Responsable Stock',
            'email'    => 'responsable@stock.ma',
            'password' => Hash::make('password'),
            'role'     => 'responsable',
        ]);

        $magasinier = User::create([
            'name'     => 'Magasinier',
            'email'    => 'magasinier@stock.ma',
            'password' => Hash::make('password'),
            'role'     => 'magasinier',
        ]);

        $fournisseurUser = User::create([
            'name'     => 'Fournisseur Global',
            'email'    => 'fournisseur@stock.ma',
            'password' => Hash::make('password'),
            'role'     => 'fournisseur',
        ]);

        // ── Categories ───────────────────────────────────────────────
        $cats = collect([
            ['nom' => 'Informatique',  'description' => 'Matériel et composants informatiques'],
            ['nom' => 'Mobilier',      'description' => 'Mobilier de bureau'],
            ['nom' => 'Fournitures',   'description' => 'Fournitures de bureau'],
            ['nom' => 'Électronique',  'description' => 'Appareils électroniques'],
            ['nom' => 'Accessoires',   'description' => 'Accessoires divers'],
        ])->map(fn($c) => Categorie::create($c));

        // ── Fournisseurs ─────────────────────────────────────────────
        $f1 = Fournisseur::create(['nom' => 'Global Logistix', 'email' => 'contact@globallogistix.com', 'telephone' => '+212 522 00 11 22', 'ville' => 'Casablanca', 'pays' => 'Maroc', 'rating' => 5, 'statut' => 'Actif']);
        $f2 = Fournisseur::create(['nom' => 'TechSupply Co.',  'email' => 'sales@techsupply.ma',        'telephone' => '+212 537 12 34 56', 'ville' => 'Rabat',       'pays' => 'Maroc', 'rating' => 4, 'statut' => 'Actif']);
        $f3 = Fournisseur::create(['nom' => 'Nordic Parts',    'email' => 'hello@nordicparts.com',       'telephone' => '+33 1 40 50 60 70', 'ville' => 'Paris',        'pays' => 'France', 'rating' => 4, 'statut' => 'Actif']);
        $f4 = Fournisseur::create(['nom' => 'EuroTrade S.A.',  'email' => 'info@eurotrade.es',           'telephone' => '+34 91 234 56 78',  'ville' => 'Madrid',       'pays' => 'Espagne', 'rating' => 3, 'statut' => 'Inactif']);

        // ── Articles ─────────────────────────────────────────────────
        $articles = [
            ['code' => 'ART-001', 'designation' => 'Laptop Dell XPS 15',    'categorie_id' => $cats[0]->id, 'prix_unitaire' => 14500, 'stock_actuel' => 45,  'stock_min' => 10, 'stock_max' => 100, 'unite' => 'pcs'],
            ['code' => 'ART-002', 'designation' => 'Cartouche Encre HP 305','categorie_id' => $cats[2]->id, 'prix_unitaire' => 350,   'stock_actuel' => 5,   'stock_min' => 20, 'stock_max' => 200, 'unite' => 'pcs'],
            ['code' => 'ART-003', 'designation' => 'Souris Sans Fil',       'categorie_id' => $cats[4]->id, 'prix_unitaire' => 120,   'stock_actuel' => 52,  'stock_min' => 50, 'stock_max' => 300, 'unite' => 'pcs'],
            ['code' => 'ART-004', 'designation' => 'Bureau Réglable',       'categorie_id' => $cats[1]->id, 'prix_unitaire' => 2800,  'stock_actuel' => 12,  'stock_min' => 5,  'stock_max' => 50,  'unite' => 'pcs'],
            ['code' => 'ART-005', 'designation' => 'Écran 27" 4K',          'categorie_id' => $cats[0]->id, 'prix_unitaire' => 3200,  'stock_actuel' => 24,  'stock_min' => 15, 'stock_max' => 80,  'unite' => 'pcs'],
            ['code' => 'ART-006', 'designation' => 'Clavier Logitech MX',   'categorie_id' => $cats[4]->id, 'prix_unitaire' => 280,   'stock_actuel' => 30,  'stock_min' => 15, 'stock_max' => 150, 'unite' => 'pcs'],
            ['code' => 'ART-007', 'designation' => 'Disque Dur Externe 1To','categorie_id' => $cats[0]->id, 'prix_unitaire' => 650,   'stock_actuel' => 0,   'stock_min' => 5,  'stock_max' => 50,  'unite' => 'pcs'],
            ['code' => 'ART-008', 'designation' => 'Chaise Ergonomique',    'categorie_id' => $cats[1]->id, 'prix_unitaire' => 1800,  'stock_actuel' => 8,   'stock_min' => 3,  'stock_max' => 30,  'unite' => 'pcs'],
        ];

        $articleModels = collect($articles)->map(fn($a) => Article::create($a));

        // Link articles to fournisseurs
        $articleModels[0]->fournisseurs()->attach([$f1->id, $f2->id]);
        $articleModels[1]->fournisseurs()->attach($f1->id);
        $articleModels[2]->fournisseurs()->attach($f2->id);
        $articleModels[4]->fournisseurs()->attach([$f2->id, $f3->id]);

        // ── Mouvements ───────────────────────────────────────────────
        $mouvements = [
            ['article_id' => 1, 'type' => 'entree', 'quantite' => 50,  'motif' => 'Achat fournisseur',    'fournisseur_id' => $f1->id, 'date_mouvement' => now()->subDays(4)->toDateString(), 'stock_avant' => 0,  'stock_apres' => 50],
            ['article_id' => 2, 'type' => 'entree', 'quantite' => 100, 'motif' => 'Achat fournisseur',    'fournisseur_id' => $f1->id, 'date_mouvement' => now()->subDays(3)->toDateString(), 'stock_avant' => 0,  'stock_apres' => 100],
            ['article_id' => 1, 'type' => 'sortie', 'quantite' => 5,   'motif' => 'Vente client',         'destinataire'   => 'Dept. IT', 'date_mouvement' => now()->subDays(2)->toDateString(), 'stock_avant' => 50, 'stock_apres' => 45],
            ['article_id' => 2, 'type' => 'sortie', 'quantite' => 95,  'motif' => 'Consommation interne', 'destinataire'   => 'Bureau',   'date_mouvement' => now()->subDays(1)->toDateString(), 'stock_avant' => 100,'stock_apres' => 5],
            ['article_id' => 5, 'type' => 'entree', 'quantite' => 24,  'motif' => 'Achat fournisseur',    'fournisseur_id' => $f2->id, 'date_mouvement' => now()->toDateString(),           'stock_avant' => 0,  'stock_apres' => 24],
        ];

        foreach ($mouvements as $m) {
            Mouvement::create(array_merge($m, ['user_id' => $admin->id, 'reference_document' => null, 'notes' => null]));
        }

        // ── Commandes ────────────────────────────────────────────────
        $c1 = Commande::create(['fournisseur_id' => $f1->id, 'date_commande' => now()->subDays(10)->toDateString(), 'statut' => 'Reçu',      'total' => 45200, 'user_id' => $admin->id]);
        $c2 = Commande::create(['fournisseur_id' => $f2->id, 'date_commande' => now()->subDays(5)->toDateString(),  'statut' => 'Envoyé',    'total' => 0,     'user_id' => $admin->id]);
        $c3 = Commande::create(['fournisseur_id' => $f3->id, 'date_commande' => now()->subDays(2)->toDateString(),  'statut' => 'Brouillon', 'total' => 0,     'user_id' => $admin->id]);

        LigneCommande::create(['commande_id' => $c1->id, 'article_id' => 1, 'quantite' => 3,  'prix_unitaire' => 14500]);
        LigneCommande::create(['commande_id' => $c1->id, 'article_id' => 5, 'quantite' => 2,  'prix_unitaire' => 3200]);
        LigneCommande::create(['commande_id' => $c2->id, 'article_id' => 3, 'quantite' => 50, 'prix_unitaire' => 120]);
        LigneCommande::create(['commande_id' => $c3->id, 'article_id' => 2, 'quantite' => 200,'prix_unitaire' => 350]);
    }
}
