import RestaurantInfo from "@/components/restaurant/RestaurantInfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Star, List, ExternalLink } from "lucide-react";

const RestaurantDetails = () => {
  const photos = [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    "https://images.unsplash.com/photo-1544148103-0773bf10d330",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de",
    "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa"
  ];

  const popularItems = [
    {
      name: "Signature Pasta",
      image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
      price: "$24.99",
      description: "House-made pasta with truffle cream sauce"
    },
    {
      name: "Wagyu Steak",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947",
      price: "$59.99",
      description: "Premium grade wagyu with seasonal vegetables"
    },
    {
      name: "Fresh Seafood Platter",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de",
      price: "$45.99",
      description: "Daily selection of fresh seafood"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <RestaurantInfo />

            {/* Photos Section */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div 
                      key={index} 
                      className="aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <img
                        src={photo}
                        alt={`Restaurant photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Menu Items */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Popular Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {popularItems.map((item, index) => (
                    <div 
                      key={index}
                      className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02] bg-white"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-secondary">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <p className="text-primary font-semibold mt-2">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Menu Items */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  Recommended Menu Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02] bg-white">
                      <img
                        src={`https://picsum.photos/100/100?random=${item}`}
                        alt="Menu item"
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-secondary">Menu Item {item}</h3>
                        <p className="text-sm text-gray-600 mt-1">Description of the menu item goes here</p>
                        <p className="text-primary font-semibold mt-2">$15.99</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Full Menu */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-6 h-6" />
                  Full Menu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <TableRow key={item} className="hover:bg-gray-50">
                        <TableCell className="font-medium">Menu Item {item}</TableCell>
                        <TableCell>Delicious description of menu item {item}</TableCell>
                        <TableCell>${(10 + item).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 md:sticky md:top-4 self-start">
            {/* Match Score Details */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Why We Think You'll Love It</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Taste Profile", "Price Range", "Atmosphere", "Service"].map((category) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{category}</span>
                        <span className="text-primary font-semibold">90%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: "90%" }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Options */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Order Now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "OpenTable", link: "#" },
                  { name: "DoorDash", link: "#" },
                  { name: "Uber Eats", link: "#" }
                ].map((platform) => (
                  <Button
                    key={platform.name}
                    variant="outline"
                    className="w-full justify-between hover:bg-primary/5"
                    asChild
                  >
                    <a href={platform.link} target="_blank" rel="noopener noreferrer">
                      {platform.name}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
