'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from '@/services/axios';
import { loginSuccess } from '@/services/store/auth';
import { store } from '@/services/store';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function AuthCard() {
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async () => {
    try {
      const token = `${email}:${password}`;
      const encodedToken = Buffer.from(token).toString('base64');
      const response = await axios.post('/users/login', undefined, {
        headers: { Authorization: `Basic ${encodedToken}` },
      });
      store.dispatch(loginSuccess(response.data));
      router.replace('/Profile');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegistration = async () => {
    try {
      const response = await axios.post('/users', {
        name,
        surname,
        phone,
        psw: password,
        mail: email,
      });

      const token = `${email}:${password}`;
      const encodedToken = Buffer.from(token).toString('base64');
      const loginResponse = await axios.post('/users/login', undefined, {
        headers: { Authorization: `Basic ${encodedToken}` },
      });
      store.dispatch(loginSuccess(loginResponse.data));
      router.replace('/Profile');
      router.refresh();
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const clearFields = () => {
    setEmail('');
    setPassword('');
    setName('');
    setSurname('');
    setPhone('');
  };

  return (
    <Card className="w-full max-w-md mx-auto my-4 p-6 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Benvenuto</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registrati</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <div className="grid gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="example@example.com"
                value={email}
                onChange={({ target }) => setEmail(target.value)}
              />
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                placeholder="············"
                maxLength={20}
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </div>
          </TabsContent>
          <TabsContent value="register">
            <div className="grid gap-4">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Nome"
                value={name}
                onChange={({ target }) => setName(target.value)}
              />
              <Label htmlFor="surname">Cognome</Label>
              <Input
                id="surname"
                placeholder="Cognome"
                value={surname}
                onChange={({ target }) => setSurname(target.value)}
              />
              <Label htmlFor="phone">Telefono</Label>
              <Input
                type="tel"
                id="phone"
                placeholder="123456789"
                value={phone}
                onChange={({ target }) => setPhone(target.value)}
              />
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="example@example.com"
                value={email}
                onChange={({ target }) => setEmail(target.value)}
              />
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                placeholder="············"
                maxLength={20}
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={clearFields}>
          Annulla
        </Button>
        <Button onClick={tab === 'login' ? handleLogin : handleRegistration}>
          {tab === 'login' ? 'Login' : 'Registrati'}
        </Button>
      </CardFooter>
    </Card>
  );
}
